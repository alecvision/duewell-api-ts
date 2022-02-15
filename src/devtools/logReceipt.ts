const logReceipt = (receipt) => {
    console.log("Merchant Name:", receipt.merchantName?.value);
    console.log('Merchant Aliases:')
    for (const alias of receipt.merchantAliases?.values ?? []) {
        console.log("", alias.value)
    }
    console.log("Merchant Address:", receipt.merchantAddress?.value);
    console.log("Merchant Phone:", receipt.merchantPhoneNumber?.value);
    console.log("Receipt Type:", receipt.receiptType?.value);
    console.log("Transaction Currency:", receipt.currency?.value);

    console.log("Items:");
    for (const { properties: item } of receipt.items?.values ?? []) {
        console.log("-", item.name?.value);
        console.log("  Description:", item.description?.value);
        console.log("  Date:", item.date?.value);
        console.log("  Unit Price:", item.price?.value);
        console.log("  Quantity:", item.quantity?.value);
        console.log("  Total Price:", item.totalPrice?.value);
        console.log("  Category:", item.category?.value);
    }

    console.log("Transaction Date:", receipt.transactionDate?.value);
    console.log("Transaction Time:", receipt.transactionTime?.value);
    console.log("Subtotal:", receipt.subtotal?.value);
    console.log("Tip:", receipt.tip?.value);
    console.log("Tax:", receipt.tax?.value);
    console.log("Total:", receipt.total?.value);
}

export default logReceipt