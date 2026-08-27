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
exports.seedRegions = seedRegions;
/**
 * Varios estados en distintas zonas de distancia (A-G respecto a Durango)
 * para poder probar checkout multivendedor sin capturar datos a mano.
 */
var ESTADOS = [
    {
        region: 'Noroeste',
        estado: 'Durango',
        codigo: 'DGO',
        latitud: 24.02772,
        longitud: -104.653175,
        ciudad: 'Durango',
        codigosPostales: [
            { codigo: '34000', latitud: 24.02772, longitud: -104.653175 },
            { codigo: '34180', latitud: 24.00893, longitud: -104.64089 },
        ],
    },
    {
        region: 'Occidente',
        estado: 'Jalisco',
        codigo: 'JAL',
        latitud: 20.6597,
        longitud: -103.3496,
        ciudad: 'Guadalajara',
        codigosPostales: [
            { codigo: '44100', latitud: 20.6597, longitud: -103.3496 },
        ],
    },
    {
        region: 'Sureste',
        estado: 'Quintana Roo',
        codigo: 'ROO',
        latitud: 21.1619,
        longitud: -86.8515,
        ciudad: 'Cancún',
        codigosPostales: [
            { codigo: '77500', latitud: 21.1619, longitud: -86.8515 },
        ],
    },
];
function seedRegions(prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var mexico, _i, ESTADOS_1, data, region, estado, ciudad, _a, _b, cp;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🌎 Sembrando geografía...');
                    return [4 /*yield*/, prisma.pais.upsert({
                            where: {
                                codigoIso2: 'MX',
                            },
                            update: {},
                            create: {
                                nombre: 'México',
                                codigoIso2: 'MX',
                                codigoIso3: 'MEX',
                            },
                        })];
                case 1:
                    mexico = _c.sent();
                    _i = 0, ESTADOS_1 = ESTADOS;
                    _c.label = 2;
                case 2:
                    if (!(_i < ESTADOS_1.length)) return [3 /*break*/, 10];
                    data = ESTADOS_1[_i];
                    return [4 /*yield*/, prisma.region.upsert({
                            where: {
                                nombre: data.region,
                            },
                            update: {},
                            create: {
                                nombre: data.region,
                                descripcion: 'Región de desarrollo',
                            },
                        })];
                case 3:
                    region = _c.sent();
                    return [4 /*yield*/, prisma.estadoProvincia.upsert({
                            where: {
                                paisId_nombre: {
                                    paisId: mexico.id,
                                    nombre: data.estado,
                                },
                            },
                            update: {
                                latitud: data.latitud,
                                longitud: data.longitud,
                            },
                            create: {
                                paisId: mexico.id,
                                regionId: region.id,
                                nombre: data.estado,
                                codigo: data.codigo,
                                latitud: data.latitud,
                                longitud: data.longitud,
                            },
                        })];
                case 4:
                    estado = _c.sent();
                    return [4 /*yield*/, prisma.ciudad.upsert({
                            where: {
                                estadoProvinciaId_nombre: {
                                    estadoProvinciaId: estado.id,
                                    nombre: data.ciudad,
                                },
                            },
                            update: {},
                            create: {
                                estadoProvinciaId: estado.id,
                                nombre: data.ciudad,
                            },
                        })];
                case 5:
                    ciudad = _c.sent();
                    _a = 0, _b = data.codigosPostales;
                    _c.label = 6;
                case 6:
                    if (!(_a < _b.length)) return [3 /*break*/, 9];
                    cp = _b[_a];
                    return [4 /*yield*/, prisma.codigoPostal.upsert({
                            where: {
                                ciudadId_codigo: {
                                    ciudadId: ciudad.id,
                                    codigo: cp.codigo,
                                },
                            },
                            update: {},
                            create: {
                                ciudadId: ciudad.id,
                                codigo: cp.codigo,
                                latitud: cp.latitud,
                                longitud: cp.longitud,
                            },
                        })];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10:
                    console.log("   \u2705 Geograf\u00EDa lista (".concat(ESTADOS.length, " estados)"));
                    return [2 /*return*/];
            }
        });
    });
}
