export interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    location: string;
    tickets: Record<string, TicketStock>;
}

export interface TicketStock {
    price: number;
    total: number;
    available: number;
    locked: number;
}

export interface Order {
    id: string;
    eventId: string;
    ticketType: string;
    quantity: number;
    user: {
        name: string;
        phone: string;
    };
    status: 'PENDING' | 'PAID' | 'EXPIRED';
    createdAt: string;
    expiresAt: string;
    totalAmount: number;
    qrCode?: string;
}
