import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCardsTable1700000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed the cards table with 30 default cards
    await queryRunner.query(`
            INSERT INTO "cards" ("code", "matrix") VALUES
            ('CARD_001', '[[8,10,null,30,null,50,60,null,80],[null,11,21,null,41,51,null,71,null],[null,null,22,32,42,null,62,72,82]]'),
            ('CARD_002', '[[1,null,20,31,null,52,null,70,81],[null,12,null,33,43,53,63,null,null],[2,13,23,null,44,null,null,73,83]]'),
            ('CARD_003', '[[null,14,24,null,45,54,64,null,84],[3,null,null,34,null,55,65,74,85],[4,15,25,35,46,null,null,null,null]]'),
            ('CARD_004', '[[5,null,26,36,null,null,66,75,86],[null,16,null,37,47,56,null,null,87],[6,17,27,null,48,null,67,76,null]]'),
            ('CARD_005', '[[null,18,28,38,49,null,null,77,null],[7,null,null,39,40,57,68,null,88],[8,19,29,null,null,58,null,78,89]]'),
            ('CARD_006', '[[9,null,20,null,41,59,69,null,90],[null,10,21,30,null,null,60,79,null],[1,11,null,null,42,50,null,70,80]]'),
            ('CARD_007', '[[null,null,22,31,43,51,null,71,81],[2,12,null,null,44,null,61,72,null],[3,13,23,32,null,52,62,null,82]]'),
            ('CARD_008', '[[4,14,null,33,null,53,63,null,83],[null,15,24,34,45,null,null,73,84],[5,null,25,null,null,54,64,74,null]]'),
            ('CARD_009', '[[6,16,26,null,46,null,65,null,85],[null,null,27,35,47,55,null,75,null],[7,17,null,36,null,56,66,76,86]]'),
            ('CARD_010', '[[8,null,null,37,48,null,67,77,87],[null,18,28,null,49,57,null,null,88],[9,19,29,38,null,58,68,null,null]]'),
            ('CARD_011', '[[1,null,20,39,null,null,69,78,89],[2,10,null,30,40,59,null,null,90],[null,null,21,null,41,50,60,79,80]]'),
            ('CARD_012', '[[3,11,22,null,42,null,61,null,81],[null,12,null,31,null,51,62,70,null],[4,13,23,32,43,null,null,null,82]]'),
            ('CARD_013', '[[5,14,null,null,44,52,null,71,83],[null,null,24,33,45,null,63,72,null],[6,15,25,34,null,53,null,null,84]]'),
            ('CARD_014', '[[null,16,26,null,null,54,64,73,85],[7,17,null,35,46,55,null,null,null],[8,null,27,36,null,null,65,74,86]]'),
            ('CARD_015', '[[9,18,null,37,47,null,null,75,87],[null,19,28,null,48,56,66,null,null],[1,null,29,38,null,57,null,76,88]]'),
            ('CARD_016', '[[2,10,null,39,null,58,67,null,89],[3,null,20,null,49,null,68,77,90],[null,11,21,30,40,59,null,null,null]]'),
            ('CARD_017', '[[null,12,22,null,41,50,null,78,80],[4,13,null,31,null,null,69,79,null],[null,null,23,32,42,51,60,70,81]]'),
            ('CARD_018', '[[5,14,24,null,43,null,61,null,82],[null,null,25,33,44,52,null,71,83],[6,15,null,null,null,53,62,72,null]]'),
            ('CARD_019', '[[7,16,null,34,null,54,63,null,84],[null,17,26,35,45,null,null,73,85],[8,null,null,null,46,55,64,null,86]]'),
            ('CARD_020', '[[null,null,27,36,47,56,null,74,87],[9,18,28,null,null,null,65,75,null],[1,19,null,37,48,null,null,null,88]]'),
            ('CARD_021', '[[2,null,29,null,49,57,66,null,89],[null,10,null,38,40,null,67,76,null],[3,11,20,39,null,58,null,null,90]]'),
            ('CARD_022', '[[null,12,21,null,41,null,68,77,80],[4,13,null,30,null,59,null,78,81],[5,null,22,31,42,50,null,null,null]]'),
            ('CARD_023', '[[6,14,null,32,43,null,69,null,82],[null,15,23,null,44,51,60,79,null],[7,null,null,33,null,52,61,70,83]]'),
            ('CARD_024', '[[8,16,24,null,45,53,null,null,84],[null,null,25,34,null,54,62,null,85],[9,17,null,null,46,null,63,71,86]]'),
            ('CARD_025', '[[1,null,26,35,null,55,null,72,87],[null,18,null,36,47,null,64,73,null],[2,19,27,null,48,56,null,null,88]]'),
            ('CARD_026', '[[3,null,28,null,49,57,65,null,89],[4,10,null,37,null,58,null,74,90],[null,11,29,38,40,null,null,75,null]]'),
            ('CARD_027', '[[null,12,20,39,null,59,66,null,80],[5,13,null,null,41,null,67,76,null],[6,null,21,30,null,50,null,77,81]]'),
            ('CARD_028', '[[7,14,22,null,42,null,68,null,82],[null,null,23,31,43,51,null,78,83],[8,15,null,null,null,52,69,79,null]]'),
            ('CARD_029', '[[9,16,null,32,44,null,60,null,84],[1,null,24,null,45,53,null,70,85],[null,17,25,33,null,54,61,null,null]]'),
            ('CARD_030', '[[null,18,26,34,null,55,62,null,86],[2,19,null,null,46,56,null,71,87],[3,null,27,35,null,null,63,72,null]]');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This will remove all data from the cards table when rolling back the seed
    await queryRunner.query(`DELETE FROM "cards"`);
  }
}
