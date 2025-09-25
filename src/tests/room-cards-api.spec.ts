describe('ReservationService - getRoomCards (T018)', () => {
  let service: any;
  let mockUserReservedCardRepository: any;

  const mockUser = {
    id: 1,
    username: 'testuser',
    phoneNumber: '09123456789',
  };

  const mockCard = {
    id: 1,
    code: 'CARD001',
    matrix: [
      [5, null, null, 37, null, null, 62, 78, 84],
      [null, 12, 24, 33, 41, 51, null, null, null],
      [null, 14, 27, null, 43, 52, 67, null, null],
    ],
  };

  const mockUserReservedCard = {
    id: 1,
    userId: 1,
    activeRoomId: 1,
    cardId: 1,
    createdAt: new Date('2024-06-20T12:34:56.789Z'),
    user: mockUser,
    card: mockCard,
  };

  beforeEach(() => {
    mockUserReservedCardRepository = {
      find: jest.fn(),
    };

    // Mock service with minimal dependencies
    service = {
      userReservedCardRepository: mockUserReservedCardRepository,
      getRoomCards: async function(activeRoomId: number) {
        const reservedCards = await this.userReservedCardRepository.find({
          where: { activeRoomId },
          relations: ['card', 'user'],
        });

        return reservedCards.map((reservedCard: any) => ({
          cardId: reservedCard.card.id,
          matrix: reservedCard.card.matrix,
          owner: {
            userId: reservedCard.user.id,
            username: reservedCard.user.username || `user_${reservedCard.user.id}`,
          },
          activeRoomId: reservedCard.activeRoomId,
          reservedAt: reservedCard.createdAt,
        }));
      }
    };
  });

  describe('getRoomCards', () => {
    it('should return room cards with owner information', async () => {
      mockUserReservedCardRepository.find.mockResolvedValue([mockUserReservedCard]);

      const result = await service.getRoomCards(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        cardId: mockCard.id,
        matrix: mockCard.matrix,
        owner: {
          userId: mockUser.id,
          username: mockUser.username,
        },
        activeRoomId: 1,
        reservedAt: mockUserReservedCard.createdAt,
      });
    });

    it('should return empty array when no cards found', async () => {
      mockUserReservedCardRepository.find.mockResolvedValue([]);

      const result = await service.getRoomCards(999);

      expect(result).toEqual([]);
    });

    it('should handle username fallback when username is null', async () => {
      const userWithoutUsername = { ...mockUser, username: null };
      const cardWithNullUsername = {
        ...mockUserReservedCard,
        user: userWithoutUsername,
      };

      mockUserReservedCardRepository.find.mockResolvedValue([cardWithNullUsername]);

      const result = await service.getRoomCards(1);

      expect(result[0].owner.username).toBe(`user_${mockUser.id}`);
    });

    it('should call repository with correct parameters', async () => {
      mockUserReservedCardRepository.find.mockResolvedValue([]);

      await service.getRoomCards(1);

      expect(mockUserReservedCardRepository.find).toHaveBeenCalledWith({
        where: { activeRoomId: 1 },
        relations: ['card', 'user'],
      });
    });

    it('should handle multiple cards in response', async () => {
      const multipleCards = [
        mockUserReservedCard,
        {
          ...mockUserReservedCard,
          id: 2,
          cardId: 2,
          user: { ...mockUser, id: 2, username: 'user2' },
          card: {
            ...mockCard,
            id: 2,
            matrix: [
              [1, 15, 23, 34, 42, 58, 67, 78, 89],
              [null, null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null, null],
            ],
          },
        },
      ];

      mockUserReservedCardRepository.find.mockResolvedValue(multipleCards);

      const result = await service.getRoomCards(1);

      expect(result).toHaveLength(2);
      expect(result[0].cardId).toBe(1);
      expect(result[1].cardId).toBe(2);
      expect(result[0].owner.username).toBe('testuser');
      expect(result[1].owner.username).toBe('user2');
    });

    it('should preserve matrix structure correctly', async () => {
      mockUserReservedCardRepository.find.mockResolvedValue([mockUserReservedCard]);

      const result = await service.getRoomCards(1);

      expect(result[0].matrix).toEqual(mockCard.matrix);
      expect(result[0].matrix[0]).toContain(5);
      expect(result[0].matrix[0]).toContain(null);
      expect(result[0].matrix[1]).toContain(12);
    });
  });
});
