const data = {
    customers: [
        {
            id: "customer_1",
            first_name: "Andrey",
            last_name: "Alekseev",
            phone: "+79296758019",
            workplace: "SteelWorks",
            position: "Worker"
        }
    ],
    products: [
        {
            name: "Cement #001",
            category: "Materials",
            sku: "SKU_001",
            purchase_price: 460.34,
            sale_price: 699.99
        },
        {
            name: "Paint #002",
            category: "Paints",
            sku: "SKU_002",
            purchase_price: 120.50,
            sale_price: 200.00
        },
        {
            name: "Hammer #003",
            category: "Tools",
            sku: "SKU_003",
            purchase_price: 300.00,
            sale_price: 450.00
        }
    ],
    sellers: [
        {
            id: "seller_1",
            first_name: "Alexey",
            last_name: "Petrov",
            start_date: "2024-07-17",
            position: "Senior Seller"
        },
        {
            id: "seller_2",
            first_name: "Mikhail",
            last_name: "Nikolaev",
            start_date: "2024-05-12",
            position: "Senior Seller"
        },
        {
            id: "seller_3",
            first_name: "Ivan",
            last_name: "Petrov",
            start_date: "2024-06-18",
            position: "Seller"
        }
    ],
    purchase_records: [
        {
            receipt_id: "receipt_1",
            date: "2023-12-04",
            seller_id: "seller_1",
            customer_id: "customer_1",
            items: [
                {
                    sku: "SKU_001",
                    discount: 5.0,
                    quantity: 2,
                    sale_price: 699.99
                },
                {
                    sku: "SKU_002",
                    discount: 0.0,
                    quantity: 1,
                    sale_price: 200.00
                }
            ]
        },
        {
            receipt_id: "receipt_2",
            date: "2023-12-05",
            seller_id: "seller_2",
            customer_id: "customer_1",
            items: [
                {
                    sku: "SKU_003",
                    discount: 10.0,
                    quantity: 1,
                    sale_price: 450.00
                }
            ]
        },
        {
            receipt_id: "receipt_3",
            date: "2023-12-06",
            seller_id: "seller_3",
            customer_id: "customer_1",
            items: [
                {
                    sku: "SKU_001",
                    discount: 2.5,
                    quantity: 1,
                    sale_price: 699.99
                }
            ]
        }
    ]
};
