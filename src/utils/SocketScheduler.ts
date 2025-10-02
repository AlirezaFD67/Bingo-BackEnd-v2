// SocketScheduler.ts
import { Server, Socket, Namespace } from "socket.io";
import { Logger } from "@nestjs/common";

// نوع Job
interface Job {
    intervalMs: number;
    callback: () => void | Promise<void>;
    timer?: NodeJS.Timeout;
    startTime?: number;
    expectedNext?: number;
    avoidCatchUp?: boolean; // when true, never schedule sooner than interval
}

export class SocketScheduler {
    private static instance: SocketScheduler;
    private jobs: Map<string, Job> = new Map();
    private io?: Server;
    private namespaces: Map<string, Namespace> = new Map();
    private isRunning: boolean = false;
    private readonly logger = new Logger(SocketScheduler.name);

    private constructor() {}

    // Singleton
    public static getInstance(): SocketScheduler {
        if (!SocketScheduler.instance) {
            SocketScheduler.instance = new SocketScheduler();
        }
        return SocketScheduler.instance;
    }

    // ست کردن io
    public setIO(io: Server) {
        this.io = io;
    }

    // ثبت یک Namespace (می‌تواند Server یا Namespace باشد)
    public registerNamespace(namespacePath: string, namespace: Server | Namespace) {
        this.namespaces.set(namespacePath, namespace as Namespace);
    }

    // اضافه کردن Job
    public addJob(
        name: string,
        intervalMs: number,
        callback: () => void | Promise<void>,
        options?: { avoidCatchUp?: boolean }
    ) {
        if (this.jobs.has(name)) {
            this.removeJob(name);
        }
        const job: Job = { intervalMs, callback, avoidCatchUp: options?.avoidCatchUp };
        this.jobs.set(name, job);
        
        // اگر scheduler در حال اجراست، job جدید رو بلافاصله شروع کن
        if (this.isRunning) {
            this.logger.log(`Starting job '${name}' immediately (scheduler is running)`);
            this.startPreciseJob(job, name);
        } else {
            this.logger.log(`Job '${name}' registered (will start when scheduler starts)`);
        }
    }

    // حذف Job
    public removeJob(name: string) {
        const job = this.jobs.get(name);
        if (job && job.timer) {
            clearTimeout(job.timer);
        }
        this.jobs.delete(name);
    }

    // شروع همه Jobها
    public start() {
        this.isRunning = true;
        this.logger.log(`Starting scheduler with ${this.jobs.size} jobs`);
        this.jobs.forEach((job, name) => {
            if (!job.timer) {
                this.logger.log(`Starting job '${name}' with ${job.intervalMs}ms interval`);
                this.startPreciseJob(job, name);
            }
        });
    }

    // شروع Job با تایمر دقیق
    private startPreciseJob(job: Job, name: string) {
        job.startTime = Date.now();
        job.expectedNext = job.startTime + job.intervalMs;

        const runJob = async () => {
            const now = Date.now();
            const drift = now - job.expectedNext!;
            
            this.logger.debug(`Job '${name}' executing (drift: ${drift}ms)`);
            
            try {
                await job.callback();
            } catch (err) {
                this.logger.error(`Error in job ${name}:`, err);
            }

            // محاسبه زمان بعدی
            if (job.avoidCatchUp) {
                // بدون catch-up: تیک ثابت ~ interval، تاخیرها انباشته نشوند
                job.expectedNext! += job.intervalMs;
                const now2 = Date.now();
                // اگر از برنامه عقب افتادیم، تیک بعدی را از اکنون + interval برنامه‌ریزی کن
                const nextTarget = Math.max(job.expectedNext!, now2 + job.intervalMs);
                const delay = Math.max(0, nextTarget - now2);
                job.timer = setTimeout(runJob, delay);
            } else {
                // با catch-up: اختلاف را جبران کن تا به برنامه نزدیک بماند
                job.expectedNext! += job.intervalMs;
                const nextInterval = Math.max(0, job.intervalMs - drift);
                job.timer = setTimeout(runJob, nextInterval);
            }
        };

        job.timer = setTimeout(runJob, job.intervalMs);
    }

    // توقف همه Jobها
    public stop() {
        this.isRunning = false;
        this.jobs.forEach((job) => {
            if (job.timer) {
                clearTimeout(job.timer);
                job.timer = undefined;
            }
        });
    }

    // Helper: emit به همه در یک namespace
    public emitToNamespace(namespacePath: string, event: string, data: any) {
        const namespace = this.namespaces.get(namespacePath);
        if (!namespace) {
            this.logger.warn(`Namespace ${namespacePath} not registered`);
            return;
        }
        namespace.emit(event, data);
    }

    // Helper: emit به یک Socket
    public emitToSocket(socket: Socket, event: string, data: any) {
        socket.emit(event, data);
    }

    // دریافت وضعیت scheduler برای دیباگ
    public getStatus() {
        return {
            isRunning: this.isRunning,
            totalJobs: this.jobs.size,
            jobs: Array.from(this.jobs.entries()).map(([name, job]) => ({
                name,
                intervalMs: job.intervalMs,
                isActive: !!job.timer,
                startTime: job.startTime ? new Date(job.startTime).toISOString() : null,
                expectedNext: job.expectedNext ? new Date(job.expectedNext).toISOString() : null,
            })),
        };
    }
}
