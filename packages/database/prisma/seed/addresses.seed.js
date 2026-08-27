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
exports.seedAddresses = seedAddresses;
function seedAddresses(prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var pais, estado, ciudad, codigoPostal, clienteUsuario, vendedorUsuario, direccionCliente, relacionCliente, estadoJalisco, ciudadGuadalajara, codigoPostalGuadalajara, direccionOficinaCliente, relacionOficinaCliente, direccionVendedor, relacionVendedor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('📍 Seeding direcciones...');
                    return [4 /*yield*/, prisma.pais.findUniqueOrThrow({
                            where: {
                                codigoIso2: 'MX',
                            },
                        })];
                case 1:
                    pais = _a.sent();
                    return [4 /*yield*/, prisma.estadoProvincia.findFirstOrThrow({
                            where: {
                                nombre: 'Durango',
                            },
                        })];
                case 2:
                    estado = _a.sent();
                    return [4 /*yield*/, prisma.ciudad.findFirstOrThrow({
                            where: {
                                nombre: 'Durango',
                                estadoProvinciaId: estado.id,
                            },
                        })];
                case 3:
                    ciudad = _a.sent();
                    return [4 /*yield*/, prisma.codigoPostal.findFirstOrThrow({
                            where: {
                                codigo: '34000',
                                ciudadId: ciudad.id,
                            },
                        })];
                case 4:
                    codigoPostal = _a.sent();
                    return [4 /*yield*/, prisma.usuario.findUniqueOrThrow({
                            where: {
                                email: 'cliente@correosclic.mx',
                            },
                            include: {
                                cliente: true,
                            },
                        })];
                case 5:
                    clienteUsuario = _a.sent();
                    return [4 /*yield*/, prisma.usuario.findUniqueOrThrow({
                            where: {
                                email: 'vendedor@correosclic.mx',
                            },
                            include: {
                                cliente: true,
                            },
                        })];
                case 6:
                    vendedorUsuario = _a.sent();
                    if (!clienteUsuario.cliente) {
                        throw new Error('Cliente no encontrado.');
                    }
                    if (!vendedorUsuario.cliente) {
                        throw new Error('Cliente del vendedor no encontrado.');
                    }
                    return [4 /*yield*/, prisma.direccion.findFirst({
                            where: {
                                alias: 'Casa',
                                calle: 'Av. 20 de Noviembre',
                                numeroExterior: '100',
                            },
                        })];
                case 7:
                    direccionCliente = _a.sent();
                    if (!!direccionCliente) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.direccion.create({
                            data: {
                                paisId: pais.id,
                                estadoProvinciaId: estado.id,
                                ciudadId: ciudad.id,
                                codigoPostalId: codigoPostal.id,
                                alias: 'Casa',
                                calle: 'Av. 20 de Noviembre',
                                numeroExterior: '100',
                                numeroInterior: null,
                                colonia: 'Centro',
                                referencias: 'Frente a la plaza principal',
                                direccionFormateada: 'Av. 20 de Noviembre 100, Centro, Durango, Dgo.',
                                latitud: codigoPostal.latitud,
                                longitud: codigoPostal.longitud,
                            },
                        })];
                case 8:
                    direccionCliente = _a.sent();
                    _a.label = 9;
                case 9: return [4 /*yield*/, prisma.direccionCliente.findFirst({
                        where: {
                            clienteId: clienteUsuario.cliente.id,
                            direccionId: direccionCliente.id,
                        },
                    })];
                case 10:
                    relacionCliente = _a.sent();
                    if (!!relacionCliente) return [3 /*break*/, 12];
                    return [4 /*yield*/, prisma.direccionCliente.create({
                            data: {
                                clienteId: clienteUsuario.cliente.id,
                                direccionId: direccionCliente.id,
                                esPrincipal: true,
                            },
                        })];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12: return [4 /*yield*/, prisma.estadoProvincia.findFirstOrThrow({
                        where: {
                            nombre: 'Jalisco',
                        },
                    })];
                case 13:
                    estadoJalisco = _a.sent();
                    return [4 /*yield*/, prisma.ciudad.findFirstOrThrow({
                            where: {
                                nombre: 'Guadalajara',
                                estadoProvinciaId: estadoJalisco.id,
                            },
                        })];
                case 14:
                    ciudadGuadalajara = _a.sent();
                    return [4 /*yield*/, prisma.codigoPostal.findFirstOrThrow({
                            where: {
                                codigo: '44100',
                                ciudadId: ciudadGuadalajara.id,
                            },
                        })];
                case 15:
                    codigoPostalGuadalajara = _a.sent();
                    return [4 /*yield*/, prisma.direccion.findFirst({
                            where: {
                                alias: 'Oficina',
                                calle: 'Av. Chapultepec',
                                numeroExterior: '250',
                            },
                        })];
                case 16:
                    direccionOficinaCliente = _a.sent();
                    if (!!direccionOficinaCliente) return [3 /*break*/, 18];
                    return [4 /*yield*/, prisma.direccion.create({
                            data: {
                                paisId: pais.id,
                                estadoProvinciaId: estadoJalisco.id,
                                ciudadId: ciudadGuadalajara.id,
                                codigoPostalId: codigoPostalGuadalajara.id,
                                alias: 'Oficina',
                                calle: 'Av. Chapultepec',
                                numeroExterior: '250',
                                numeroInterior: '4',
                                colonia: 'Americana',
                                referencias: 'Edificio de cristal, planta baja',
                                direccionFormateada: 'Av. Chapultepec 250-4, Americana, Guadalajara, Jal.',
                                latitud: codigoPostalGuadalajara.latitud,
                                longitud: codigoPostalGuadalajara.longitud,
                            },
                        })];
                case 17:
                    direccionOficinaCliente = _a.sent();
                    _a.label = 18;
                case 18: return [4 /*yield*/, prisma.direccionCliente.findFirst({
                        where: {
                            clienteId: clienteUsuario.cliente.id,
                            direccionId: direccionOficinaCliente.id,
                        },
                    })];
                case 19:
                    relacionOficinaCliente = _a.sent();
                    if (!!relacionOficinaCliente) return [3 /*break*/, 21];
                    return [4 /*yield*/, prisma.direccionCliente.create({
                            data: {
                                clienteId: clienteUsuario.cliente.id,
                                direccionId: direccionOficinaCliente.id,
                                esPrincipal: false,
                            },
                        })];
                case 20:
                    _a.sent();
                    _a.label = 21;
                case 21: return [4 /*yield*/, prisma.direccion.findFirst({
                        where: {
                            alias: 'Negocio',
                            calle: 'Blvd. Felipe Pescador',
                            numeroExterior: '500',
                        },
                    })];
                case 22:
                    direccionVendedor = _a.sent();
                    if (!!direccionVendedor) return [3 /*break*/, 24];
                    return [4 /*yield*/, prisma.direccion.create({
                            data: {
                                paisId: pais.id,
                                estadoProvinciaId: estado.id,
                                ciudadId: ciudad.id,
                                codigoPostalId: codigoPostal.id,
                                alias: 'Negocio',
                                calle: 'Blvd. Felipe Pescador',
                                numeroExterior: '500',
                                numeroInterior: null,
                                colonia: 'Zona Centro',
                                referencias: 'Frente a Soriana Centro',
                                direccionFormateada: 'Blvd. Felipe Pescador 500, Zona Centro, Durango, Dgo.',
                                latitud: codigoPostal.latitud,
                                longitud: codigoPostal.longitud,
                            },
                        })];
                case 23:
                    direccionVendedor = _a.sent();
                    _a.label = 24;
                case 24: return [4 /*yield*/, prisma.direccionCliente.findFirst({
                        where: {
                            clienteId: vendedorUsuario.cliente.id,
                            direccionId: direccionVendedor.id,
                        },
                    })];
                case 25:
                    relacionVendedor = _a.sent();
                    if (!!relacionVendedor) return [3 /*break*/, 27];
                    return [4 /*yield*/, prisma.direccionCliente.create({
                            data: {
                                clienteId: vendedorUsuario.cliente.id,
                                direccionId: direccionVendedor.id,
                                esPrincipal: true,
                            },
                        })];
                case 26:
                    _a.sent();
                    _a.label = 27;
                case 27:
                    console.log('   ✅ Dirección del cliente creada');
                    console.log('   ✅ Segunda dirección del cliente (Guadalajara) creada');
                    console.log('   ✅ Dirección del vendedor creada');
                    return [2 /*return*/, {
                            clienteDireccion: direccionCliente,
                            clienteDireccionOficina: direccionOficinaCliente,
                            vendedorDireccion: direccionVendedor,
                        }];
            }
        });
    });
}
