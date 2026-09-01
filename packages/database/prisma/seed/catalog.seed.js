"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.seedCatalog = seedCatalog;
function seedCatalog(prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var vendedorUsuario, tienda, electronica, oficina, ropa, mouse, teclados, audio, monitores, papeleria, accesorios, playeras, color, talla, negro, blanco, rojo, azul, tallaS, tallaM, tallaL, mouseG203, tecladoKumara, hyperx, playeraCorreos, libreta, imagenes, _i, imagenes_1, imagen, variantes, variantesCreadas, _a, variantes_1, variante, creada, _b, _c, valor, hogar, otrosVendedores, productosOtrosVendedores, _d, otrosVendedores_1, data, usuarioVendedor, tiendaVendedor, producto, variante, _e, _f, valorId;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log('📦 Seeding catálogo...');
                    return [4 /*yield*/, prisma.usuario.findUniqueOrThrow({
                            where: {
                                email: 'vendedor@correosclic.mx',
                            },
                            include: {
                                vendedor: true,
                            },
                        })];
                case 1:
                    vendedorUsuario = _g.sent();
                    if (!vendedorUsuario.vendedor) {
                        throw new Error('No existe el vendedor.');
                    }
                    return [4 /*yield*/, prisma.tienda.upsert({
                            where: {
                                vendedorId: vendedorUsuario.vendedor.id,
                            },
                            update: {
                                nombre: 'TechStore Durango',
                                descripcion: 'Tecnología y accesorios para oficina y gaming.',
                                activa: true,
                            },
                            create: {
                                vendedorId: vendedorUsuario.vendedor.id,
                                codigoPublico: 'TECH-DGO',
                                nombre: 'TechStore Durango',
                                descripcion: 'Tecnología y accesorios para oficina y gaming.',
                                activa: true,
                            },
                        })];
                case 2:
                    tienda = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'electronica',
                            },
                            update: {},
                            create: {
                                nombre: 'Electrónica',
                                slug: 'electronica',
                                descripcion: 'Productos electrónicos.',
                            },
                        })];
                case 3:
                    electronica = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'oficina',
                            },
                            update: {},
                            create: {
                                nombre: 'Oficina',
                                slug: 'oficina',
                                descripcion: 'Papelería y accesorios de oficina.',
                            },
                        })];
                case 4:
                    oficina = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'ropa',
                            },
                            update: {},
                            create: {
                                nombre: 'Ropa',
                                slug: 'ropa',
                                descripcion: 'Ropa y accesorios.',
                            },
                        })];
                case 5:
                    ropa = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'mouse',
                            },
                            update: {},
                            create: {
                                parentId: electronica.id,
                                nombre: 'Mouse',
                                slug: 'mouse',
                            },
                        })];
                case 6:
                    mouse = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'teclados',
                            },
                            update: {},
                            create: {
                                parentId: electronica.id,
                                nombre: 'Teclados',
                                slug: 'teclados',
                            },
                        })];
                case 7:
                    teclados = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'audio',
                            },
                            update: {},
                            create: {
                                parentId: electronica.id,
                                nombre: 'Audio',
                                slug: 'audio',
                            },
                        })];
                case 8:
                    audio = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'monitores',
                            },
                            update: {},
                            create: {
                                parentId: electronica.id,
                                nombre: 'Monitores',
                                slug: 'monitores',
                            },
                        })];
                case 9:
                    monitores = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'papeleria',
                            },
                            update: {},
                            create: {
                                parentId: oficina.id,
                                nombre: 'Papelería',
                                slug: 'papeleria',
                            },
                        })];
                case 10:
                    papeleria = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'accesorios-oficina',
                            },
                            update: {},
                            create: {
                                parentId: oficina.id,
                                nombre: 'Accesorios',
                                slug: 'accesorios-oficina',
                            },
                        })];
                case 11:
                    accesorios = _g.sent();
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: {
                                slug: 'playeras',
                            },
                            update: {},
                            create: {
                                parentId: ropa.id,
                                nombre: 'Playeras',
                                slug: 'playeras',
                            },
                        })];
                case 12:
                    playeras = _g.sent();
                    return [4 /*yield*/, prisma.atributo.upsert({
                            where: {
                                nombre: 'Color',
                            },
                            update: {},
                            create: {
                                nombre: 'Color',
                            },
                        })];
                case 13:
                    color = _g.sent();
                    return [4 /*yield*/, prisma.atributo.upsert({
                            where: {
                                nombre: 'Tamaño',
                            },
                            update: {},
                            create: {
                                nombre: 'Tamaño',
                            },
                        })];
                case 14:
                    talla = _g.sent();
                    return [4 /*yield*/, prisma.valorAtributo.upsert({
                            where: {
                                atributoId_valor: {
                                    atributoId: color.id,
                                    valor: 'Negro',
                                },
                            },
                            update: {},
                            create: {
                                atributoId: color.id,
                                valor: 'Negro',
                            },
                        })];
                case 15:
                    negro = _g.sent();
                    return [4 /*yield*/, prisma.valorAtributo.upsert({
                            where: {
                                atributoId_valor: {
                                    atributoId: color.id,
                                    valor: 'Blanco',
                                },
                            },
                            update: {},
                            create: {
                                atributoId: color.id,
                                valor: 'Blanco',
                            },
                        })];
                case 16:
                    blanco = _g.sent();
                    return [4 /*yield*/, prisma.valorAtributo.upsert({
                            where: {
                                atributoId_valor: {
                                    atributoId: color.id,
                                    valor: 'Rojo',
                                },
                            },
                            update: {},
                            create: {
                                atributoId: color.id,
                                valor: 'Rojo',
                            },
                        })];
                case 17:
                    rojo = _g.sent();
                    return [4 /*yield*/, prisma.valorAtributo.upsert({
                            where: {
                                atributoId_valor: {
                                    atributoId: color.id,
                                    valor: 'Azul',
                                },
                            },
                            update: {},
                            create: {
                                atributoId: color.id,
                                valor: 'Azul',
                            },
                        })];
                case 18:
                    azul = _g.sent();
                    return [4 /*yield*/, prisma.valorAtributo.upsert({
                            where: {
                                atributoId_valor: {
                                    atributoId: talla.id,
                                    valor: 'S',
                                },
                            },
                            update: {},
                            create: {
                                atributoId: talla.id,
                                valor: 'S',
                            },
                        })];
                case 19:
                    tallaS = _g.sent();
                    return [4 /*yield*/, prisma.valorAtributo.upsert({
                            where: {
                                atributoId_valor: {
                                    atributoId: talla.id,
                                    valor: 'M',
                                },
                            },
                            update: {},
                            create: {
                                atributoId: talla.id,
                                valor: 'M',
                            },
                        })];
                case 20:
                    tallaM = _g.sent();
                    return [4 /*yield*/, prisma.valorAtributo.upsert({
                            where: {
                                atributoId_valor: {
                                    atributoId: talla.id,
                                    valor: 'L',
                                },
                            },
                            update: {},
                            create: {
                                atributoId: talla.id,
                                valor: 'L',
                            },
                        })];
                case 21:
                    tallaL = _g.sent();
                    return [4 /*yield*/, prisma.producto.upsert({
                            where: {
                                codigoPublico: 'PROD-000001',
                            },
                            update: {},
                            create: {
                                tiendaId: tienda.id,
                                categoriaId: mouse.id,
                                codigoPublico: 'PROD-000001',
                                nombre: 'Mouse Logitech G203 Lightsync',
                                descripcion: 'Mouse gamer Logitech G203 Lightsync con sensor de alta precisión y retroiluminación RGB.',
                                pesoKg: 0.085,
                                activo: true,
                                publicado: true,
                            },
                        })];
                case 22:
                    mouseG203 = _g.sent();
                    return [4 /*yield*/, prisma.producto.upsert({
                            where: {
                                codigoPublico: 'PROD-000002',
                            },
                            update: {},
                            create: {
                                tiendaId: tienda.id,
                                categoriaId: teclados.id,
                                codigoPublico: 'PROD-000002',
                                nombre: 'Teclado Mecánico Redragon Kumara K552',
                                descripcion: 'Teclado mecánico compacto con switches Outemu y retroiluminación LED.',
                                pesoKg: 0.860,
                                activo: true,
                                publicado: true,
                            },
                        })];
                case 23:
                    tecladoKumara = _g.sent();
                    return [4 /*yield*/, prisma.producto.upsert({
                            where: {
                                codigoPublico: 'PROD-000003',
                            },
                            update: {},
                            create: {
                                tiendaId: tienda.id,
                                categoriaId: audio.id,
                                codigoPublico: 'PROD-000003',
                                nombre: 'HyperX Cloud Stinger',
                                descripcion: 'Audífonos gamer HyperX Cloud Stinger con micrófono abatible.',
                                pesoKg: 0.320,
                                activo: true,
                                publicado: true,
                            },
                        })];
                case 24:
                    hyperx = _g.sent();
                    return [4 /*yield*/, prisma.producto.upsert({
                            where: {
                                codigoPublico: 'PROD-000004',
                            },
                            update: {},
                            create: {
                                tiendaId: tienda.id,
                                categoriaId: playeras.id,
                                codigoPublico: 'PROD-000004',
                                nombre: 'Playera Oficial CorreosClic',
                                descripcion: 'Playera oficial de algodón con logotipo de CorreosClic.',
                                pesoKg: 0.180,
                                activo: true,
                                publicado: true,
                            },
                        })];
                case 25:
                    playeraCorreos = _g.sent();
                    return [4 /*yield*/, prisma.producto.upsert({
                            where: {
                                codigoPublico: 'PROD-000005',
                            },
                            update: {},
                            create: {
                                tiendaId: tienda.id,
                                categoriaId: papeleria.id,
                                codigoPublico: 'PROD-000005',
                                nombre: 'Libreta Profesional A5',
                                descripcion: 'Libreta profesional de pasta dura con 100 hojas.',
                                pesoKg: 0.410,
                                activo: true,
                                publicado: true,
                            },
                        })];
                case 26:
                    libreta = _g.sent();
                    imagenes = [
                        {
                            productoId: mouseG203.id,
                            storageKey: 'products/logitech-g203.jpg',
                            url: 'https://cdn.correosclic.dev/products/logitech-g203.jpg',
                        },
                        {
                            productoId: tecladoKumara.id,
                            storageKey: 'products/redragon-k552.jpg',
                            url: 'https://cdn.correosclic.dev/products/redragon-k552.jpg',
                        },
                        {
                            productoId: hyperx.id,
                            storageKey: 'products/hyperx-cloud-stinger.jpg',
                            url: 'https://cdn.correosclic.dev/products/hyperx-cloud-stinger.jpg',
                        },
                        {
                            productoId: playeraCorreos.id,
                            storageKey: 'products/playera-correosclic.jpg',
                            url: 'https://cdn.correosclic.dev/products/playera-correosclic.jpg',
                        },
                        {
                            productoId: libreta.id,
                            storageKey: 'products/libreta-profesional.jpg',
                            url: 'https://cdn.correosclic.dev/products/libreta-profesional.jpg',
                        },
                    ];
                    _i = 0, imagenes_1 = imagenes;
                    _g.label = 27;
                case 27:
                    if (!(_i < imagenes_1.length)) return [3 /*break*/, 31];
                    imagen = imagenes_1[_i];
                    return [4 /*yield*/, prisma.productoImagen.deleteMany({
                            where: {
                                productoId: imagen.productoId,
                            },
                        })];
                case 28:
                    _g.sent();
                    return [4 /*yield*/, prisma.productoImagen.create({
                            data: {
                                productoId: imagen.productoId,
                                storageKey: imagen.storageKey,
                                url: imagen.url,
                                orden: 1,
                                esPrincipal: true,
                            },
                        })];
                case 29:
                    _g.sent();
                    _g.label = 30;
                case 30:
                    _i++;
                    return [3 /*break*/, 27];
                case 31:
                    variantes = [
                        // Logitech
                        {
                            productoId: mouseG203.id,
                            sku: 'LOG-G203-BLK',
                            precio: 499,
                            pesoKg: 0.085,
                            valores: [negro.id],
                        },
                        {
                            productoId: mouseG203.id,
                            sku: 'LOG-G203-WHT',
                            precio: 499,
                            pesoKg: 0.085,
                            valores: [blanco.id],
                        },
                        // Kumara
                        {
                            productoId: tecladoKumara.id,
                            sku: 'RED-K552-BLK',
                            precio: 899,
                            pesoKg: 0.860,
                            valores: [negro.id],
                        },
                        {
                            productoId: tecladoKumara.id,
                            sku: 'RED-K552-WHT',
                            precio: 899,
                            pesoKg: 0.860,
                            valores: [blanco.id],
                        },
                        // HyperX
                        {
                            productoId: hyperx.id,
                            sku: 'HYP-STINGER-BLK',
                            precio: 1099,
                            pesoKg: 0.320,
                            valores: [negro.id],
                        },
                        {
                            productoId: hyperx.id,
                            sku: 'HYP-STINGER-RED',
                            precio: 1099,
                            pesoKg: 0.320,
                            valores: [rojo.id],
                        },
                        // Playera negra
                        {
                            productoId: playeraCorreos.id,
                            sku: 'CC-TEE-BLK-S',
                            precio: 299,
                            pesoKg: 0.180,
                            valores: [negro.id, tallaS.id],
                        },
                        {
                            productoId: playeraCorreos.id,
                            sku: 'CC-TEE-BLK-M',
                            precio: 299,
                            pesoKg: 0.180,
                            valores: [negro.id, tallaM.id],
                        },
                        {
                            productoId: playeraCorreos.id,
                            sku: 'CC-TEE-BLK-L',
                            precio: 299,
                            pesoKg: 0.180,
                            valores: [negro.id, tallaL.id],
                        },
                        // Playera blanca
                        {
                            productoId: playeraCorreos.id,
                            sku: 'CC-TEE-WHT-S',
                            precio: 299,
                            pesoKg: 0.180,
                            valores: [blanco.id, tallaS.id],
                        },
                        {
                            productoId: playeraCorreos.id,
                            sku: 'CC-TEE-WHT-M',
                            precio: 299,
                            pesoKg: 0.180,
                            valores: [blanco.id, tallaM.id],
                        },
                        {
                            productoId: playeraCorreos.id,
                            sku: 'CC-TEE-WHT-L',
                            precio: 299,
                            pesoKg: 0.180,
                            valores: [blanco.id, tallaL.id],
                        },
                        // Libreta
                        {
                            productoId: libreta.id,
                            sku: 'NOTEBOOK-A5',
                            precio: 149,
                            pesoKg: 0.410,
                            valores: [],
                        },
                    ];
                    variantesCreadas = [];
                    _a = 0, variantes_1 = variantes;
                    _g.label = 32;
                case 32:
                    if (!(_a < variantes_1.length)) return [3 /*break*/, 41];
                    variante = variantes_1[_a];
                    return [4 /*yield*/, prisma.productoVariante.upsert({
                            where: {
                                sku: variante.sku,
                            },
                            update: {
                                precio: variante.precio,
                                pesoKg: variante.pesoKg,
                                activa: true,
                            },
                            create: {
                                productoId: variante.productoId,
                                sku: variante.sku,
                                precio: variante.precio,
                                pesoKg: variante.pesoKg,
                                activa: true,
                            },
                        })];
                case 33:
                    creada = _g.sent();
                    return [4 /*yield*/, prisma.productoVarianteValor.deleteMany({
                            where: {
                                productoVarianteId: creada.id,
                            },
                        })];
                case 34:
                    _g.sent();
                    _b = 0, _c = variante.valores;
                    _g.label = 35;
                case 35:
                    if (!(_b < _c.length)) return [3 /*break*/, 38];
                    valor = _c[_b];
                    return [4 /*yield*/, prisma.productoVarianteValor.create({
                            data: {
                                productoVarianteId: creada.id,
                                valorAtributoId: valor,
                            },
                        })];
                case 36:
                    _g.sent();
                    _g.label = 37;
                case 37:
                    _b++;
                    return [3 /*break*/, 35];
                case 38: return [4 /*yield*/, prisma.inventario.upsert({
                        where: {
                            productoVarianteId: creada.id,
                        },
                        update: {
                            stockDisponible: 50,
                            stockReservado: 0,
                            stockMinimo: 5,
                        },
                        create: {
                            productoVarianteId: creada.id,
                            stockDisponible: 50,
                            stockReservado: 0,
                            stockMinimo: 5,
                        },
                    })];
                case 39:
                    _g.sent();
                    variantesCreadas.push(creada);
                    _g.label = 40;
                case 40:
                    _a++;
                    return [3 /*break*/, 32];
                case 41: return [4 /*yield*/, prisma.categoria.upsert({
                        where: {
                            slug: 'hogar',
                        },
                        update: {},
                        create: {
                            nombre: 'Hogar',
                            slug: 'hogar',
                            descripcion: 'Artículos para el hogar.',
                        },
                    })];
                case 42:
                    hogar = _g.sent();
                    otrosVendedores = [
                        {
                            email: 'vendedor2@correosclic.mx',
                            tienda: {
                                codigoPublico: 'ELEC-JAL',
                                nombre: 'Jalisco Electronics',
                                descripcion: 'Electrónica y monitores.',
                            },
                            producto: {
                                codigoPublico: 'PROD-000006',
                                nombre: 'Monitor LG 24" Full HD',
                                descripcion: 'Monitor LG de 24 pulgadas, panel IPS, Full HD.',
                                pesoKg: 3.5,
                                categoriaId: monitores.id,
                            },
                            variante: {
                                sku: 'LG-MON24-BLK',
                                precio: 3499,
                                pesoKg: 3.5,
                                valores: [negro.id],
                            },
                            imagen: {
                                storageKey: 'products/lg-monitor-24.jpg',
                                url: 'https://cdn.correosclic.dev/products/lg-monitor-24.jpg',
                            },
                        },
                        {
                            email: 'vendedor3@correosclic.mx',
                            tienda: {
                                codigoPublico: 'HOGAR-ROO',
                                nombre: 'Caribbean Crafts',
                                descripcion: 'Artesanías y productos para el hogar.',
                            },
                            producto: {
                                codigoPublico: 'PROD-000007',
                                nombre: 'Hamaca Artesanal Yucateca',
                                descripcion: 'Hamaca tejida a mano, tamaño matrimonial.',
                                pesoKg: 1.2,
                                categoriaId: hogar.id,
                            },
                            variante: {
                                sku: 'HAM-YUC-XL',
                                precio: 899,
                                pesoKg: 1.2,
                                valores: [],
                            },
                            imagen: {
                                storageKey: 'products/hamaca-artesanal.jpg',
                                url: 'https://cdn.correosclic.dev/products/hamaca-artesanal.jpg',
                            },
                        },
                    ];
                    productosOtrosVendedores = [];
                    _d = 0, otrosVendedores_1 = otrosVendedores;
                    _g.label = 43;
                case 43:
                    if (!(_d < otrosVendedores_1.length)) return [3 /*break*/, 57];
                    data = otrosVendedores_1[_d];
                    return [4 /*yield*/, prisma.usuario.findUniqueOrThrow({
                            where: {
                                email: data.email,
                            },
                            include: {
                                vendedor: true,
                            },
                        })];
                case 44:
                    usuarioVendedor = _g.sent();
                    if (!usuarioVendedor.vendedor) {
                        throw new Error("No existe el vendedor ".concat(data.email, "."));
                    }
                    return [4 /*yield*/, prisma.tienda.upsert({
                            where: {
                                vendedorId: usuarioVendedor.vendedor.id,
                            },
                            update: __assign(__assign({}, data.tienda), { activa: true }),
                            create: __assign(__assign({ vendedorId: usuarioVendedor.vendedor.id }, data.tienda), { activa: true }),
                        })];
                case 45:
                    tiendaVendedor = _g.sent();
                    return [4 /*yield*/, prisma.producto.upsert({
                            where: {
                                codigoPublico: data.producto.codigoPublico,
                            },
                            update: {},
                            create: __assign(__assign({ tiendaId: tiendaVendedor.id }, data.producto), { activo: true, publicado: true }),
                        })];
                case 46:
                    producto = _g.sent();
                    return [4 /*yield*/, prisma.productoImagen.deleteMany({
                            where: {
                                productoId: producto.id,
                            },
                        })];
                case 47:
                    _g.sent();
                    return [4 /*yield*/, prisma.productoImagen.create({
                            data: __assign(__assign({ productoId: producto.id }, data.imagen), { orden: 1, esPrincipal: true }),
                        })];
                case 48:
                    _g.sent();
                    return [4 /*yield*/, prisma.productoVariante.upsert({
                            where: {
                                sku: data.variante.sku,
                            },
                            update: {
                                precio: data.variante.precio,
                                pesoKg: data.variante.pesoKg,
                                activa: true,
                            },
                            create: {
                                productoId: producto.id,
                                sku: data.variante.sku,
                                precio: data.variante.precio,
                                pesoKg: data.variante.pesoKg,
                                activa: true,
                            },
                        })];
                case 49:
                    variante = _g.sent();
                    return [4 /*yield*/, prisma.productoVarianteValor.deleteMany({
                            where: {
                                productoVarianteId: variante.id,
                            },
                        })];
                case 50:
                    _g.sent();
                    _e = 0, _f = data.variante.valores;
                    _g.label = 51;
                case 51:
                    if (!(_e < _f.length)) return [3 /*break*/, 54];
                    valorId = _f[_e];
                    return [4 /*yield*/, prisma.productoVarianteValor.create({
                            data: {
                                productoVarianteId: variante.id,
                                valorAtributoId: valorId,
                            },
                        })];
                case 52:
                    _g.sent();
                    _g.label = 53;
                case 53:
                    _e++;
                    return [3 /*break*/, 51];
                case 54: return [4 /*yield*/, prisma.inventario.upsert({
                        where: {
                            productoVarianteId: variante.id,
                        },
                        update: {
                            stockDisponible: 20,
                            stockReservado: 0,
                            stockMinimo: 3,
                        },
                        create: {
                            productoVarianteId: variante.id,
                            stockDisponible: 20,
                            stockReservado: 0,
                            stockMinimo: 3,
                        },
                    })];
                case 55:
                    _g.sent();
                    productosOtrosVendedores.push({
                        tienda: tiendaVendedor,
                        producto: producto,
                        variante: variante,
                    });
                    _g.label = 56;
                case 56:
                    _d++;
                    return [3 /*break*/, 43];
                case 57:
                    console.log('   ✓ Catálogo creado');
                    console.log("   \u2713 ".concat(variantesCreadas.length, " variantes creadas"));
                    console.log("   \u2713 ".concat(productosOtrosVendedores.length, " tiendas/productos de otros vendedores creados"));
                    return [2 /*return*/, {
                            tienda: tienda,
                            productos: {
                                mouseG203: mouseG203,
                                tecladoKumara: tecladoKumara,
                                hyperx: hyperx,
                                playeraCorreos: playeraCorreos,
                                libreta: libreta,
                            },
                            variantes: variantesCreadas,
                            otrosVendedores: productosOtrosVendedores,
                        }];
            }
        });
    });
}
