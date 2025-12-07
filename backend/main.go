package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"
	"sync"
	"time"
)

// --- Domain Types ---

type TicketType string

const (
	Regular TicketType = "Regular"
	VIP     TicketType = "VIP"
)

type Event struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Date        string            `json:"date"`
	Location    string            `json:"location"`
	Tickets     map[TicketType]*TicketStock `json:"tickets"`
}

type TicketStock struct {
	Price     int `json:"price"`
	Total     int `json:"total"`
	Available int `json:"available"`
	Locked    int `json:"locked"` // Transaksi pending
}

type Order struct {
	ID         string     `json:"id"`
	EventID    string     `json:"eventId"`
	TicketType TicketType `json:"ticketType"`
	Quantity   int        `json:"quantity"`
	User       User       `json:"user"`
	Status     string     `json:"status"` // PENDING, PAID, EXPIRED
	CreatedAt  time.Time  `json:"createdAt"`
	ExpiresAt  time.Time  `json:"expiresAt"`
	TotalAmount int       `json:"totalAmount"`
	QRCode     string     `json:"qrCode,omitempty"`
}

type User struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

// --- In-Memory Store & Mutex ---

var (
	events    = make(map[string]*Event)
	orders    = make(map[string]*Order)
	eventsMu  sync.RWMutex
	ordersMu  sync.RWMutex
	secretKey = []byte("supersecretkey_32bytes_long!!!!!") // 32 bytes for AES-256
)

func init() {
	// Seed Data
	events["ev1"] = &Event{
		ID:          "ev1",
		Name:        "Senja Fest",
		Description: "Konser band indie paling hits tahun ini.",
		Date:        "Besok, 16:00 WIB",
		Location:    "Parkir Timur Senayan",
		Tickets: map[TicketType]*TicketStock{
			Regular: {Price: 50000, Total: 100, Available: 100},
			VIP:     {Price: 150000, Total: 5, Available: 5},
		},
	}
	events["ev2"] = &Event{
		ID:          "ev2",
		Name:        "Indie Movie Night",
		Description: "Pemutaran film pendek karya anak bangsa.",
		Date:        "Sabtu, 19:00 WIB",
		Location:    "Taman Ismail Marzuki",
		Tickets: map[TicketType]*TicketStock{
			Regular: {Price: 25000, Total: 200, Available: 200},
			VIP:     {Price: 75000, Total: 20, Available: 20},
		},
	}
	events["ev3"] = &Event{
		ID:          "ev3",
		Name:        "Jazz Gunung",
		Description: "Menikmati musik jazz di ketinggian 2000mdpl.",
		Date:        "Minggu, 15:00 WIB",
		Location:    "Bromo Amphitheater",
		Tickets: map[TicketType]*TicketStock{
			Regular: {Price: 250000, Total: 150, Available: 150},
			VIP:     {Price: 500000, Total: 10, Available: 10},
		},
	}
	events["ev4"] = &Event{
		ID:          "ev4",
		Name:        "Horror Marathon",
		Description: "Nonton bareng 3 film horor klasik Indonesia.",
		Date:        "Jumat Malam, 21:00 WIB",
		Location:    "CGV Drive-In",
		Tickets: map[TicketType]*TicketStock{
			Regular: {Price: 40000, Total: 80, Available: 80},
			VIP:     {Price: 100000, Total: 15, Available: 15},
		},
	}
	events["ev5"] = &Event{
		ID:          "ev5",
		Name:        "Tech Conference 2024",
		Description: "Seminar teknologi terbesar di Asia Tenggara.",
		Date:        "Senin, 09:00 WIB",
		Location:    "ICE BSD City",
		Tickets: map[TicketType]*TicketStock{
			Regular: {Price: 75000, Total: 500, Available: 500},
			VIP:     {Price: 250000, Total: 50, Available: 50},
		},
	}
}

// --- Handlers ---

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*") // Allow all for MVP
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIoNS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func handleEvents(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	eventsMu.RLock()
	defer eventsMu.RUnlock()

	var eventList []*Event
	for _, e := range events {
		eventList = append(eventList, e)
	}
	
	// Sort by ID to ensure deterministic order
	sort.Slice(eventList, func(i, j int) bool {
		return eventList[i].ID < eventList[j].ID
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(eventList)
}

func handleOrder(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req Order
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	eventsMu.Lock()
	defer eventsMu.Unlock()

	event, exists := events[req.EventID]
	if !exists {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	stock, exists := event.Tickets[req.TicketType]
	if !exists {
		http.Error(w, "Ticket type not found", http.StatusBadRequest)
		return
	}

	if stock.Available < req.Quantity {
		http.Error(w, "Maaf, stok habis atau sedang dipesan orang lain", http.StatusConflict)
		return
	}

	// Lock stock
	stock.Available -= req.Quantity
	stock.Locked += req.Quantity

	// Create Order
	orderID := fmt.Sprintf("ORD-%d", time.Now().UnixNano())
	newOrder := &Order{
		ID:          orderID,
		EventID:     req.EventID,
		TicketType:  req.TicketType,
		Quantity:    req.Quantity,
		User:        req.User,
		Status:      "PENDING",
		CreatedAt:   time.Now(),
		ExpiresAt:   time.Now().Add(5 * time.Minute),
		TotalAmount: stock.Price * req.Quantity,
	}

	ordersMu.Lock()
	orders[orderID] = newOrder
	ordersMu.Unlock()

	// Release stock goroutine if not paid
	go func(id string, evID string, tType TicketType, qty int) {
		time.Sleep(5 * time.Minute)
		ordersMu.Lock()
		o, ok := orders[id]
		if ok && o.Status == "PENDING" {
			o.Status = "EXPIRED"
			// Return stock
			eventsMu.Lock()
			if ev, ok := events[evID]; ok {
				if st, ok := ev.Tickets[tType]; ok {
					st.Locked -= qty
					st.Available += qty
					log.Printf("Order %s expired, stock released", id)
				}
			}
			eventsMu.Unlock()
		}
		ordersMu.Unlock()
	}(orderID, req.EventID, req.TicketType, req.Quantity)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newOrder)
}

func handlePay(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	orderID := r.URL.Query().Get("id")
	if orderID == "" {
		http.Error(w, "Missing order ID", http.StatusBadRequest)
		return
	}

	ordersMu.Lock()
	order, exists := orders[orderID]
	if !exists {
		ordersMu.Unlock()
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	if order.Status != "PENDING" {
		ordersMu.Unlock()
		http.Error(w, "Order is not pending", http.StatusBadRequest)
		return
	}

	// Simulate Payment Processing
	order.Status = "PAID"
	
	// Generate Encrypted QR Token
	tokenData := fmt.Sprintf("%s|%s|%s|PAID", order.EventID, order.ID, order.User.Phone)
	encryptedToken, err := encrypt([]byte(tokenData), secretKey)
	if err != nil {
		log.Println("Encrypt error:", err)
		order.QRCode = "ERROR_GEN_QR"
	} else {
		order.QRCode = base64.StdEncoding.EncodeToString(encryptedToken)
	}
	
	ordersMu.Unlock()

	// Update Event Stock (Move from Locked to Sold - effectively just remove Locked count as Available is already reduced)
	eventsMu.Lock()
	if ev, ok := events[order.EventID]; ok {
		if st, ok := ev.Tickets[order.TicketType]; ok {
			st.Locked -= order.Quantity
			// Total remains same, Available remains same (reduced), Locked becomes 0.
			// Effectively "Sold" = Total - Available.
		}
	}
	eventsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

func handleOrderDetail(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	orderID := r.URL.Query().Get("id")
	ordersMu.RLock()
	order, exists := orders[orderID]
	ordersMu.RUnlock()

	if !exists {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(order)
}

// --- Utils ---

func encrypt(plaintext []byte, key []byte) ([]byte, error) {
	c, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(c)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	return gcm.Seal(nonce, nonce, plaintext, nil), nil
}

func main() {
	http.HandleFunc("/api/events", handleEvents)
	http.HandleFunc("/api/order", handleOrder)
	http.HandleFunc("/api/pay", handlePay)
	http.HandleFunc("/api/order-detail", handleOrderDetail)

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
