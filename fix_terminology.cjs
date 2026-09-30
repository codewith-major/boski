const fs = require('fs');

function replace(file, search, replace) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(file, content);
}

replace('src/components/post/TypeSelector.tsx', /Physical things you can lend/g, 'Physical things you can rent out');
replace('src/components/post/TypeSelector.tsx', /Physical things you need to borrow/g, 'Physical things you need to rent');
replace('src/components/resources/ResourceCard.tsx', /case 'ITEM': return 'Borrow';/g, "case 'ITEM': return 'Rent';");
replace('src/pages/admin/AdminOrders.tsx', /requesterName/g, 'customerName');
replace('src/pages/admin/AdminOrders.tsx', /Requester/g, 'Customer');
replace('src/pages/Home.tsx', /BORROW/g, 'RENT');
replace('src/pages/ResourceDetail.tsx', /REQUEST TO BORROW/g, 'REQUEST TO RENT');
replace('src/pages/OrderDetail.tsx', /isRequester/g, 'isCustomer');
replace('src/pages/OrderDetail.tsx', /const requesterName =/g, 'const customerName =');

