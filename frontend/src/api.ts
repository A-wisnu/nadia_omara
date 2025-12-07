import axios from 'axios';
import type { Event, Order } from './types';

// For local development with CORS, full URL might be needed if proxy isn't working perfectly, 
// but Vite proxy should handle it.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
});

export const getEvents = async () => {
    const response = await api.get<Event[]>('/events');
    return response.data;
};

export const createOrder = async (eventId: string, ticketType: string, quantity: number, user: { name: string, phone: string }) => {
    const response = await api.post<Order>('/order', {
        eventId,
        ticketType,
        quantity,
        user
    });
    return response.data;
};

export const payOrder = async (orderId: string) => {
    const response = await api.post<Order>(`/pay?id=${orderId}`);
    return response.data;
};

export const getOrderDetail = async (orderId: string) => {
    const response = await api.get<Order>(`/order-detail?id=${orderId}`);
    return response.data;
};
