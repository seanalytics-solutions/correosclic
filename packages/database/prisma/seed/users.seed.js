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
exports.seedUsers = seedUsers;
var bcrypt_1 = require("bcrypt");
var client_1 = require("@prisma/client");
var PASSWORD = 'Correos123*';
/**
 * Varios vendedores en distintos estados para poder probar el checkout
 * multivendedor (distintas zonas tarifarias) sin capturar datos a mano.
 */
var VENDEDORES = [
    {
        email: 'vendedor@correosclic.mx',
        nombre: 'María',
        apellidoPaterno: 'González',
        apellidoMaterno: 'Ramírez',
        telefono: '6183000000',
        estadoOperacion: 'Durango',
        rfc: 'XAXX010101000',
        razonSocial: 'CorreosClic Demo',
    },
    {
        email: 'vendedor2@correosclic.mx',
        nombre: 'Carlos',
        apellidoPaterno: 'Hernández',
        apellidoMaterno: 'Ibarra',
        telefono: '3312345678',
        estadoOperacion: 'Jalisco',
        rfc: 'XAXX010101001',
        razonSocial: 'CorreosClic Demo Jalisco',
    },
    {
        email: 'vendedor3@correosclic.mx',
        nombre: 'Diana',
        apellidoPaterno: 'Uc',
        apellidoMaterno: 'Cetina',
        telefono: '9981234567',
        estadoOperacion: 'Quintana Roo',
        rfc: 'XAXX010101002',
        razonSocial: 'CorreosClic Demo Quintana Roo',
    },
];
function seedUsers(prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var passwordHash, _a, rolCliente, rolVendedor, rolSuperAdmin, admin, adminRole, clienteUsuario, clienteRole, cliente, vendedores, _i, VENDEDORES_1, data, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('👥 Seeding usuarios...');
                    return [4 /*yield*/, bcrypt_1.default.hash(PASSWORD, 12)];
                case 1:
                    passwordHash = _d.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.rol.findUniqueOrThrow({
                                where: {
                                    codigo: 'CLIENTE',
                                },
                            }),
                            prisma.rol.findUniqueOrThrow({
                                where: {
                                    codigo: 'VENDEDOR',
                                },
                            }),
                            prisma.rol.findUniqueOrThrow({
                                where: {
                                    codigo: 'SUPER_ADMIN',
                                },
                            }),
                        ])];
                case 2:
                    _a = _d.sent(), rolCliente = _a[0], rolVendedor = _a[1], rolSuperAdmin = _a[2];
                    return [4 /*yield*/, prisma.usuario.upsert({
                            where: {
                                email: 'admin@correosclic.mx',
                            },
                            update: {
                                nombre: 'Super',
                                apellidoPaterno: 'Administrador',
                                apellidoMaterno: '',
                                telefono: '6181000000',
                                emailVerificado: true,
                                activo: true,
                            },
                            create: {
                                email: 'admin@correosclic.mx',
                                passwordHash: passwordHash,
                                nombre: 'Super',
                                apellidoPaterno: 'Administrador',
                                apellidoMaterno: '',
                                telefono: '6181000000',
                                emailVerificado: true,
                                activo: true,
                            },
                        })];
                case 3:
                    admin = _d.sent();
                    return [4 /*yield*/, prisma.usuarioRol.findFirst({
                            where: {
                                usuarioId: admin.id,
                                rolId: rolSuperAdmin.id,
                            },
                        })];
                case 4:
                    adminRole = _d.sent();
                    if (!!adminRole) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma.usuarioRol.create({
                            data: {
                                usuarioId: admin.id,
                                rolId: rolSuperAdmin.id,
                            },
                        })];
                case 5:
                    _d.sent();
                    _d.label = 6;
                case 6: return [4 /*yield*/, prisma.usuario.upsert({
                        where: {
                            email: 'cliente@correosclic.mx',
                        },
                        update: {
                            nombre: 'Juan',
                            apellidoPaterno: 'Pérez',
                            apellidoMaterno: 'López',
                            telefono: '6182000000',
                            emailVerificado: true,
                            activo: true,
                        },
                        create: {
                            email: 'cliente@correosclic.mx',
                            passwordHash: passwordHash,
                            nombre: 'Juan',
                            apellidoPaterno: 'Pérez',
                            apellidoMaterno: 'López',
                            telefono: '6182000000',
                            emailVerificado: true,
                            activo: true,
                        },
                    })];
                case 7:
                    clienteUsuario = _d.sent();
                    return [4 /*yield*/, prisma.usuarioRol.findFirst({
                            where: {
                                usuarioId: clienteUsuario.id,
                                rolId: rolCliente.id,
                            },
                        })];
                case 8:
                    clienteRole = _d.sent();
                    if (!!clienteRole) return [3 /*break*/, 10];
                    return [4 /*yield*/, prisma.usuarioRol.create({
                            data: {
                                usuarioId: clienteUsuario.id,
                                rolId: rolCliente.id,
                            },
                        })];
                case 9:
                    _d.sent();
                    _d.label = 10;
                case 10: return [4 /*yield*/, prisma.cliente.upsert({
                        where: {
                            usuarioId: clienteUsuario.id,
                        },
                        update: {
                            activo: true,
                        },
                        create: {
                            usuarioId: clienteUsuario.id,
                            activo: true,
                        },
                    })];
                case 11:
                    cliente = _d.sent();
                    vendedores = [];
                    _i = 0, VENDEDORES_1 = VENDEDORES;
                    _d.label = 12;
                case 12:
                    if (!(_i < VENDEDORES_1.length)) return [3 /*break*/, 15];
                    data = VENDEDORES_1[_i];
                    _c = (_b = vendedores).push;
                    return [4 /*yield*/, seedVendor(prisma, passwordHash, data, {
                            rolCliente: rolCliente,
                            rolVendedor: rolVendedor,
                        })];
                case 13:
                    _c.apply(_b, [_d.sent()]);
                    _d.label = 14;
                case 14:
                    _i++;
                    return [3 /*break*/, 12];
                case 15:
                    console.log('   ✅ Super Admin creado');
                    console.log('   ✅ Cliente creado');
                    console.log("   \u2705 ".concat(vendedores.length, " vendedores creados"));
                    return [2 /*return*/, {
                            admin: admin,
                            clienteUsuario: clienteUsuario,
                            cliente: cliente,
                            vendedores: vendedores,
                        }];
            }
        });
    });
}
function seedVendor(prisma, passwordHash, data, roles) {
    return __awaiter(this, void 0, void 0, function () {
        var vendedorUsuario, vendedorClienteRole, clienteVendedor, solicitud, estadoOperacion, vendedor, vendedorRole;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.usuario.upsert({
                        where: {
                            email: data.email,
                        },
                        update: {
                            nombre: data.nombre,
                            apellidoPaterno: data.apellidoPaterno,
                            apellidoMaterno: data.apellidoMaterno,
                            telefono: data.telefono,
                            emailVerificado: true,
                            activo: true,
                        },
                        create: {
                            email: data.email,
                            passwordHash: passwordHash,
                            nombre: data.nombre,
                            apellidoPaterno: data.apellidoPaterno,
                            apellidoMaterno: data.apellidoMaterno,
                            telefono: data.telefono,
                            emailVerificado: true,
                            activo: true,
                        },
                    })];
                case 1:
                    vendedorUsuario = _a.sent();
                    return [4 /*yield*/, prisma.usuarioRol.findFirst({
                            where: {
                                usuarioId: vendedorUsuario.id,
                                rolId: roles.rolCliente.id,
                            },
                        })];
                case 2:
                    vendedorClienteRole = _a.sent();
                    if (!!vendedorClienteRole) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.usuarioRol.create({
                            data: {
                                usuarioId: vendedorUsuario.id,
                                rolId: roles.rolCliente.id,
                            },
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, prisma.cliente.upsert({
                        where: {
                            usuarioId: vendedorUsuario.id,
                        },
                        update: {
                            activo: true,
                        },
                        create: {
                            usuarioId: vendedorUsuario.id,
                            activo: true,
                        },
                    })];
                case 5:
                    clienteVendedor = _a.sent();
                    return [4 /*yield*/, prisma.solicitudVendedor.findFirst({
                            where: {
                                clienteId: clienteVendedor.id,
                            },
                        })];
                case 6:
                    solicitud = _a.sent();
                    if (!!solicitud) return [3 /*break*/, 8];
                    return [4 /*yield*/, prisma.solicitudVendedor.create({
                            data: {
                                clienteId: clienteVendedor.id,
                                estado: client_1.EstadoSolicitudVendedor.APROBADA,
                                pasoActual: client_1.PasoSolicitudVendedor.FINALIZADA,
                                fechaRevision: new Date(),
                                comentariosRevision: 'Solicitud aprobada automáticamente para desarrollo.',
                            },
                        })];
                case 7:
                    solicitud = _a.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, prisma.solicitudVendedor.update({
                        where: {
                            id: solicitud.id,
                        },
                        data: {
                            estado: client_1.EstadoSolicitudVendedor.APROBADA,
                            pasoActual: client_1.PasoSolicitudVendedor.FINALIZADA,
                            fechaRevision: new Date(),
                            comentariosRevision: 'Solicitud aprobada automáticamente para desarrollo.',
                        },
                    })];
                case 9:
                    solicitud = _a.sent();
                    _a.label = 10;
                case 10: return [4 /*yield*/, prisma.informacionFiscal.upsert({
                        where: {
                            solicitudVendedorId: solicitud.id,
                        },
                        update: {
                            rfc: data.rfc,
                            razonSocial: data.razonSocial,
                            regimenFiscal: '626',
                        },
                        create: {
                            solicitudVendedorId: solicitud.id,
                            rfc: data.rfc,
                            razonSocial: data.razonSocial,
                            regimenFiscal: '626',
                        },
                    })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, prisma.estadoProvincia.findFirstOrThrow({
                            where: {
                                nombre: data.estadoOperacion,
                            },
                        })];
                case 12:
                    estadoOperacion = _a.sent();
                    return [4 /*yield*/, prisma.vendedor.upsert({
                            where: {
                                usuarioId: vendedorUsuario.id,
                            },
                            update: {
                                solicitudAprobadaId: solicitud.id,
                                estadoOperacionId: estadoOperacion.id,
                                fechaAprobacion: new Date(),
                                activo: true,
                            },
                            create: {
                                usuarioId: vendedorUsuario.id,
                                solicitudAprobadaId: solicitud.id,
                                estadoOperacionId: estadoOperacion.id,
                                fechaAprobacion: new Date(),
                                activo: true,
                            },
                        })];
                case 13:
                    vendedor = _a.sent();
                    return [4 /*yield*/, prisma.usuarioRol.findFirst({
                            where: {
                                usuarioId: vendedorUsuario.id,
                                rolId: roles.rolVendedor.id,
                            },
                        })];
                case 14:
                    vendedorRole = _a.sent();
                    if (!!vendedorRole) return [3 /*break*/, 16];
                    return [4 /*yield*/, prisma.usuarioRol.create({
                            data: {
                                usuarioId: vendedorUsuario.id,
                                rolId: roles.rolVendedor.id,
                            },
                        })];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16: return [2 /*return*/, {
                        usuario: vendedorUsuario,
                        cliente: clienteVendedor,
                        solicitud: solicitud,
                        vendedor: vendedor,
                    }];
            }
        });
    });
}
