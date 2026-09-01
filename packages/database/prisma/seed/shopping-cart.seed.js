"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedShoppingCart = seedShoppingCart;
function seedShoppingCart(prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var usuario, mouseNegro, playeraBlancaM, libreta, monitorLg, hamaca, carrito, items, _i, items_1, item, carritoCompleto;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🛒 Seeding carrito de compras...');
                    return [4 /*yield*/, prisma.usuario.findUniqueOrThrow({
                            where: {
                                email: 'cliente@correosclic.mx',
                            },
                            include: {
                                cliente: true,
                            },
                        })];
                case 1:
                    usuario = _a.sent();
                    if (!usuario.cliente) {
                        throw new Error('No existe el cliente.');
                    }
                    return [4 /*yield*/, prisma.productoVariante.findUniqueOrThrow({
                            where: {
                                sku: 'LOG-G203-BLK',
                            },
                        })];
                case 2:
                    mouseNegro = _a.sent();
                    return [4 /*yield*/, prisma.productoVariante.findUniqueOrThrow({
                            where: {
                                sku: 'CC-TEE-WHT-M',
                            },
                        })];
                case 3:
                    playeraBlancaM = _a.sent();
                    return [4 /*yield*/, prisma.productoVariante.findUniqueOrThrow({
                            where: {
                                sku: 'NOTEBOOK-A5',
                            },
                        })];
                case 4:
                    libreta = _a.sent();
                    return [4 /*yield*/, prisma.productoVariante.findUniqueOrThrow({
                            where: {
                                sku: 'LG-MON24-BLK',
                            },
                        })];
                case 5:
                    monitorLg = _a.sent();
                    return [4 /*yield*/, prisma.productoVariante.findUniqueOrThrow({
                            where: {
                                sku: 'HAM-YUC-XL',
                            },
                        })];
                case 6:
                    hamaca = _a.sent();
                    return [4 /*yield*/, prisma.carrito.upsert({
                            where: {
                                clienteId: usuario.cliente.id,
                            },
                            update: {},
                            create: {
                                clienteId: usuario.cliente.id,
                            },
                        })];
                case 7:
                    carrito = _a.sent();
                    /*
                    |--------------------------------------------------------------------------
                    | LIMPIAR ITEMS EXISTENTES
                    |--------------------------------------------------------------------------
                    */
                    return [4 /*yield*/, prisma.carritoItem.deleteMany({
                            where: {
                                carritoId: carrito.id,
                            },
                        })];
                case 8:
                    /*
                    |--------------------------------------------------------------------------
                    | LIMPIAR ITEMS EXISTENTES
                    |--------------------------------------------------------------------------
                    */
                    _a.sent();
                    items = [
                        {
                            varianteId: mouseNegro.id,
                            cantidad: 1,
                        },
                        {
                            varianteId: playeraBlancaM.id,
                            cantidad: 2,
                        },
                        {
                            varianteId: libreta.id,
                            cantidad: 1,
                        },
                        {
                            varianteId: monitorLg.id,
                            cantidad: 1,
                        },
                        {
                            varianteId: hamaca.id,
                            cantidad: 2,
                        },
                    ];
                    _i = 0, items_1 = items;
                    _a.label = 9;
                case 9:
                    if (!(_i < items_1.length)) return [3 /*break*/, 12];
                    item = items_1[_i];
                    return [4 /*yield*/, prisma.carritoItem.create({
                            data: {
                                carritoId: carrito.id,
                                productoVarianteId: item.varianteId,
                                cantidad: item.cantidad,
                            },
                        })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12: return [4 /*yield*/, prisma.carrito.findUniqueOrThrow({
                        where: {
                            id: carrito.id,
                        },
                        include: {
                            items: {
                                include: {
                                    productoVariante: {
                                        include: {
                                            producto: true,
                                            valores: {
                                                include: {
                                                    valorAtributo: {
                                                        include: {
                                                            atributo: true,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    })];
                case 13:
                    carritoCompleto = _a.sent();
                    console.log("   \u2713 Carrito creado con ".concat(carritoCompleto.items.length, " productos"));
                    console.log('   ✓ Cliente: cliente@correosclic.mx');
                    return [2 /*return*/, {
                            carrito: carrito,
                            items: carritoCompleto.items,
                        }];
            }
        });
    });
}
