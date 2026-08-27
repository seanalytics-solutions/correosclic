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
exports.seedLogistics = seedLogistics;
var bcrypt_1 = require("bcrypt");
var PASSWORD = 'Correos123*';
var SUCURSALES = [
    {
        codigo: 'SUC-DGO-01',
        nombre: 'Sucursal Durango Centro',
        estadoNombre: 'Durango',
        ciudadNombre: 'Durango',
        codigoPostal: '34000',
        calle: 'Blvd. Domingo Arrieta',
        numeroExterior: '900',
    },
    {
        codigo: 'SUC-GDL-01',
        nombre: 'Sucursal Guadalajara',
        estadoNombre: 'Jalisco',
        ciudadNombre: 'Guadalajara',
        codigoPostal: '44100',
        calle: 'Av. Vallarta',
        numeroExterior: '1500',
    },
];
/**
 * Actores y sucursales mínimos para poder probar Logistics de extremo a
 * extremo: 2 sucursales (Durango y Guadalajara -- mismas ciudades que ya usa
 * addresses.seed.ts, así que un envío entre ellas ejercita el camino con
 * transferencia y un envío dentro de Durango ejercita el camino directo).
 * Idempotente: se puede correr varias veces sin duplicar nada.
 */
function seedLogistics(prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var pais, sucursalesCreadas, _i, SUCURSALES_1, data, estado, ciudad, codigoPostal, sucursal, direccion, sucursalDurango, sucursalGuadalajara, passwordHash, empleadoRepartidor, repartidor, vehiculoDurango, asignacionVigente;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚚 Seeding logistics...');
                    return [4 /*yield*/, prisma.pais.findUniqueOrThrow({
                            where: { codigoIso2: 'MX' },
                        })];
                case 1:
                    pais = _a.sent();
                    sucursalesCreadas = {};
                    _i = 0, SUCURSALES_1 = SUCURSALES;
                    _a.label = 2;
                case 2:
                    if (!(_i < SUCURSALES_1.length)) return [3 /*break*/, 11];
                    data = SUCURSALES_1[_i];
                    return [4 /*yield*/, prisma.estadoProvincia.findFirstOrThrow({
                            where: { nombre: data.estadoNombre },
                        })];
                case 3:
                    estado = _a.sent();
                    return [4 /*yield*/, prisma.ciudad.findFirstOrThrow({
                            where: { nombre: data.ciudadNombre, estadoProvinciaId: estado.id },
                        })];
                case 4:
                    ciudad = _a.sent();
                    return [4 /*yield*/, prisma.codigoPostal.findFirstOrThrow({
                            where: { codigo: data.codigoPostal, ciudadId: ciudad.id },
                        })];
                case 5:
                    codigoPostal = _a.sent();
                    return [4 /*yield*/, prisma.sucursal.findUnique({
                            where: { codigo: data.codigo },
                        })];
                case 6:
                    sucursal = _a.sent();
                    if (!!sucursal) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.direccion.create({
                            data: {
                                paisId: pais.id,
                                estadoProvinciaId: estado.id,
                                ciudadId: ciudad.id,
                                codigoPostalId: codigoPostal.id,
                                calle: data.calle,
                                numeroExterior: data.numeroExterior,
                                direccionFormateada: "".concat(data.calle, " ").concat(data.numeroExterior, ", ").concat(data.ciudadNombre),
                                latitud: codigoPostal.latitud,
                                longitud: codigoPostal.longitud,
                            },
                        })];
                case 7:
                    direccion = _a.sent();
                    return [4 /*yield*/, prisma.sucursal.create({
                            data: {
                                direccionId: direccion.id,
                                codigo: data.codigo,
                                nombre: data.nombre,
                                activa: true,
                            },
                        })];
                case 8:
                    sucursal = _a.sent();
                    _a.label = 9;
                case 9:
                    sucursalesCreadas[data.codigo] = sucursal;
                    _a.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 2];
                case 11:
                    sucursalDurango = sucursalesCreadas['SUC-DGO-01'];
                    sucursalGuadalajara = sucursalesCreadas['SUC-GDL-01'];
                    return [4 /*yield*/, bcrypt_1.default.hash(PASSWORD, 12)];
                case 12:
                    passwordHash = _a.sent();
                    return [4 /*yield*/, seedEmpleado(prisma, {
                            email: 'recepcionista.durango@correosclic.mx',
                            nombre: 'Rosa',
                            apellidoPaterno: 'Domínguez',
                            numeroEmpleado: 'EMP-DGO-001',
                            puesto: 'Recepcionista',
                            sucursalId: sucursalDurango.id,
                            passwordHash: passwordHash,
                            rolCodigo: 'RECEPCION',
                        })];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, seedEmpleado(prisma, {
                            email: 'recepcionista.guadalajara@correosclic.mx',
                            nombre: 'Luis',
                            apellidoPaterno: 'Padilla',
                            numeroEmpleado: 'EMP-GDL-001',
                            puesto: 'Recepcionista',
                            sucursalId: sucursalGuadalajara.id,
                            passwordHash: passwordHash,
                            rolCodigo: 'RECEPCION',
                        })];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, seedEmpleado(prisma, {
                            email: 'repartidor.durango@correosclic.mx',
                            nombre: 'Jorge',
                            apellidoPaterno: 'Salcido',
                            numeroEmpleado: 'EMP-DGO-002',
                            puesto: 'Repartidor',
                            sucursalId: sucursalDurango.id,
                            passwordHash: passwordHash,
                            rolCodigo: 'REPARTIDOR',
                        })];
                case 15:
                    empleadoRepartidor = _a.sent();
                    return [4 /*yield*/, prisma.repartidor.upsert({
                            where: { empleadoId: empleadoRepartidor.id },
                            update: { activo: true },
                            create: {
                                empleadoId: empleadoRepartidor.id,
                                numeroLicencia: 'LIC-DGO-0001',
                                activo: true,
                            },
                        })];
                case 16:
                    repartidor = _a.sent();
                    return [4 /*yield*/, seedVehiculo(prisma, {
                            placas: 'DGO-0001',
                            sucursalId: sucursalDurango.id,
                        })];
                case 17:
                    vehiculoDurango = _a.sent();
                    return [4 /*yield*/, seedVehiculo(prisma, {
                            placas: 'GDL-0001',
                            sucursalId: sucursalGuadalajara.id,
                        })];
                case 18:
                    _a.sent();
                    return [4 /*yield*/, prisma.asignacionVehiculo.findFirst({
                            where: { repartidorId: repartidor.id, fechaFin: null },
                        })];
                case 19:
                    asignacionVigente = _a.sent();
                    if (!!asignacionVigente) return [3 /*break*/, 21];
                    return [4 /*yield*/, prisma.asignacionVehiculo.create({
                            data: {
                                vehiculoId: vehiculoDurango.id,
                                repartidorId: repartidor.id,
                                fechaInicio: new Date(),
                            },
                        })];
                case 20:
                    _a.sent();
                    _a.label = 21;
                case 21:
                    console.log('   ✅ 2 sucursales, 3 empleados (2 RECEPCION, 1 REPARTIDOR), 1 repartidor, 2 vehículos');
                    return [2 /*return*/];
            }
        });
    });
}
function seedEmpleado(prisma, data) {
    return __awaiter(this, void 0, void 0, function () {
        var usuario, rol, rolAsignado;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.usuario.upsert({
                        where: { email: data.email },
                        update: {
                            nombre: data.nombre,
                            apellidoPaterno: data.apellidoPaterno,
                            emailVerificado: true,
                            activo: true,
                        },
                        create: {
                            email: data.email,
                            passwordHash: data.passwordHash,
                            nombre: data.nombre,
                            apellidoPaterno: data.apellidoPaterno,
                            emailVerificado: true,
                            activo: true,
                        },
                    })];
                case 1:
                    usuario = _a.sent();
                    return [4 /*yield*/, prisma.rol.findUniqueOrThrow({
                            where: { codigo: data.rolCodigo },
                        })];
                case 2:
                    rol = _a.sent();
                    return [4 /*yield*/, prisma.usuarioRol.findFirst({
                            where: { usuarioId: usuario.id, rolId: rol.id },
                        })];
                case 3:
                    rolAsignado = _a.sent();
                    if (!!rolAsignado) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma.usuarioRol.create({
                            data: { usuarioId: usuario.id, rolId: rol.id },
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, prisma.empleado.upsert({
                        where: { usuarioId: usuario.id },
                        update: {
                            sucursalId: data.sucursalId,
                            puesto: data.puesto,
                            activo: true,
                        },
                        create: {
                            usuarioId: usuario.id,
                            sucursalId: data.sucursalId,
                            numeroEmpleado: data.numeroEmpleado,
                            puesto: data.puesto,
                            fechaIngreso: new Date(),
                            activo: true,
                        },
                    })];
            }
        });
    });
}
function seedVehiculo(prisma, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, prisma.vehiculo.upsert({
                    where: { placas: data.placas },
                    update: { sucursalId: data.sucursalId, activo: true },
                    create: {
                        sucursalId: data.sucursalId,
                        placas: data.placas,
                        marca: 'Nissan',
                        modelo: 'NP300',
                        anio: 2022,
                        capacidadKg: 500,
                        activo: true,
                    },
                })];
        });
    });
}
