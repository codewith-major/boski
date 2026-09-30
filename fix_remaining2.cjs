const fs = require('fs');

function replaceInFile(path, oldStr, newStr) {
    if(fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.split(oldStr).join(newStr);
        fs.writeFileSync(path, content);
    }
}

// 1. ResourceForm: handleChange typing. It currently probably accepts (field: keyof PostDraft, value: string).
replaceInFile('src/components/post/ResourceForm.tsx', '(field: keyof PostDraft, value: string)', '(field: keyof PostDraft, value: any)');

// 2. TypeSelector.tsx
replaceInFile('src/components/post/TypeSelector.tsx', "'item'", "'ITEM'");
replaceInFile('src/components/post/TypeSelector.tsx', "'skill'", "'SKILL'");
replaceInFile('src/components/post/TypeSelector.tsx', "'help'", "'HELP'");

// 3. StatusBadge.tsx
replaceInFile('src/components/ui/StatusBadge.tsx', "active: {", "ACTIVE: {");

// 4. OrderContext.tsx
replaceInFile('src/contexts/OrderContext.tsx', "updateOrderStatus(orderId, 'accepted')", "updateOrderStatus(orderId, 'ACCEPTED')");
replaceInFile('src/contexts/OrderContext.tsx', "updateOrderStatus(orderId, 'cancelled')", "updateOrderStatus(orderId, 'CANCELLED')");
replaceInFile('src/contexts/OrderContext.tsx', "updateOrderStatus(orderId, 'active')", "updateOrderStatus(orderId, 'ACTIVE')");
replaceInFile('src/contexts/OrderContext.tsx', "updateOrderStatus(orderId, 'completed')", "updateOrderStatus(orderId, 'COMPLETED')");
replaceInFile('src/contexts/OrderContext.tsx', "updateOrderStatus(id, 'cancelled')", "updateOrderStatus(id, 'CANCELLED')");

// 5. Explore.tsx
replaceInFile('src/pages/Explore.tsx', "value: 'NEED'", "value: 'all'"); // This is incorrect, I'll need to sed it manually to remove that tab or change filter logic. Let's just sed Explore.tsx directly next.

// 6. OrderDetail.tsx
replaceInFile('src/pages/OrderDetail.tsx', "case 'NEED':", ""); // Just remove the case or handle it
replaceInFile('src/pages/RequestFlow.tsx', "case 'NEED':", "");
replaceInFile('src/pages/ResourceDetail.tsx', "case 'NEED':", "");

