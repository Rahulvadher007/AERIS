"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/lib/prisma");
async function main() {
    try {
        const count = await prisma_1.prisma.station.count();
        console.log(`✅ Connected. Stations found: ${count}`);
    }
    catch (error) {
        console.error('Failed to connect:', error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=verify-prisma.js.map