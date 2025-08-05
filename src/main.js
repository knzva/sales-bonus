/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    const { discount, sale_price, quantity } = purchase;
    
    // Переводим скидку из процентов в десятичное число
    const discountDecimal = 1 - (discount / 100);
    
    // Рассчитываем выручку: цена * количество * (1 - скидка)
    return sale_price * quantity * discountDecimal;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;
    
    // Система бонусов:
    // 15% - 1 место (наибольшая прибыль)
    // 10% - 2 и 3 места
    // 5% - все остальные, кроме последнего
    // 0% - последнее место
    
    if (index === 0) {
        // Первое место - 15%
        return profit * 0.15;
    } else if (index === 1 || index === 2) {
        // Второе и третье место - 10%
        return profit * 0.10;
    } else if (index < total - 1) {
        // Все остальные, кроме последнего - 5%
        return profit * 0.05;
    } else {
        // Последнее место - 0%
        return 0;
    }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // Проверка входных данных
    if (!data 
        || !Array.isArray(data.sellers)
        || !Array.isArray(data.products)
        || !Array.isArray(data.purchase_records)
        || data.sellers.length === 0
        || data.products.length === 0
        || data.purchase_records.length === 0) {
        throw new Error('Некорректные входные данные');
    }

    // Проверка наличия опций
    if (typeof options !== "object") {
        throw new Error('Некорректные опции');
    }
    
    const { calculateRevenue, calculateBonus } = options;
    
    if (!calculateRevenue || !calculateBonus) {
        throw new Error('Отсутствуют необходимые функции расчета');
    }
    
    if (typeof calculateRevenue !== "function" || typeof calculateBonus !== "function") {
        throw new Error('calculateRevenue и calculateBonus должны быть функциями');
    }

    // Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    // Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(
        sellerStats.map((seller, index) => [seller.id, sellerStats[index]])
    );
    
    const productIndex = Object.fromEntries(
        data.products.map(product => [product.sku, product])
    );

    // Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        
        if (!seller) {
            return; // Пропускаем, если продавец не найден
        }
        
        // Увеличиваем количество продаж
        seller.sales_count += 1;
        
        // Расчет прибыли для каждого товара в чеке
        record.items.forEach(item => {
            const product = productIndex[item.sku];
            
            if (!product) {
                return; // Пропускаем, если товар не найден
            }
            
            // Рассчитываем себестоимость товара
            const cost = product.purchase_price * item.quantity;
            
            // Рассчитываем выручку с учетом скидки
            const revenue = calculateRevenue(item, product);
            
            // Рассчитываем прибыль: выручка минус себестоимость
            const itemProfit = revenue - cost;
            
            // Увеличиваем общую накопленную прибыль и выручку продавца
            seller.profit += itemProfit;
            seller.revenue += revenue;
            
            // Учет количества проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        });
    });

    // Сортировка продавцов по прибыли (от большей к меньшей)
    sellerStats.sort((a, b) => b.profit - a.profit);

    // Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sellerStats.length, seller);
    });

    // Подготовка итоговой коллекции с нужными полями
    return sellerStats.map(seller => {
        // Формируем топ-10 продуктов
        const topProducts = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({
                sku: sku,
                quantity: quantity
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        return {
            seller_id: seller.id,
            name: seller.name,
            revenue: Math.round(seller.revenue * 100) / 100,  // Округляем до 2 знаков
            profit: +seller.profit.toFixed(2),    // Округляем до 2 знаков
            sales_count: seller.sales_count,
            top_products: topProducts,
            bonus: +seller.bonus.toFixed(2)       // Округляем до 2 знаков
        };
    });
}
