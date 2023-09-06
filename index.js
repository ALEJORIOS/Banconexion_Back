"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var dotenv_1 = require("dotenv");
var express_1 = require("express");
var db_1 = require("./db");
var exceljs_1 = require("exceljs");
var cors_1 = require("cors");
(0, dotenv_1.configDotenv)();
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Start Connection to DB
app.listen(process.env.PORT, function () {
    console.log('Listening on port ', process.env.PORT);
});
var dBConnection = new db_1.default("ep-rough-sea-49693752-pooler.us-east-1.postgres.vercel-storage.com", "Banconexion", "default", "1lWYvjDu6hfL");
var upperize = function (obj) {
    return Object.keys(obj).reduce(function (acc, k) {
        acc[k.toUpperCase()] = obj[k];
        return acc;
    }, {});
};
function sendError(err) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dBConnection.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["INSERT INTO FAILURES(DATE, ERROR) VALUES(NOW(),  ", ") RETURNING ID;"], ["INSERT INTO FAILURES(DATE, ERROR) VALUES(NOW(),  ", ") RETURNING ID;"])), err.toString()).then(function (response) {
                        return response[0].id;
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Check if project is in maintenance mode
 * @tested true
 */
app.get("/check-maintenance", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT * FROM params WHERE attribute = 'MAINTENANCE';"], ["SELECT * FROM params WHERE attribute = 'MAINTENANCE';"]))).then(function (response) {
                    res.statusCode = 200;
                    res.send([upperize(response[0])]);
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este Registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
* Get all data user including their covers
* @returns and array of objects
* @tested tested for one person
*/
app.get("/user", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var document, type;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                document = req.query.document;
                type = req.query.type;
                return [4 /*yield*/, dBConnection.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT * \n    FROM userview\n    WHERE (document = ", " AND document_type = ", ") OR\n    (SELECT id FROM persons WHERE (document = ", " AND document_type= ", ")) = ANY (PARENT_RELATIONSHIP);"], ["SELECT * \n    FROM userview\n    WHERE (document = ", " AND document_type = ", ") OR\n    (SELECT id FROM persons WHERE (document = ", " AND document_type= ", ")) = ANY (PARENT_RELATIONSHIP);"])), document, type, document, type).then(function (response) {
                        res.statusCode = 200;
                        res.send(response.map(function (user) { return upperize(user); }));
                    })
                        .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                        var errID;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, sendError(err)];
                                case 1:
                                    errID = _a.sent();
                                    res.statusCode = 409;
                                    res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Register a new user
 * The admin value is 0 by default
 * @param name - string
 * @param type - string
 * @param document - string
 * @param age - number
 * @param transport - 1 0
 * @param area - string
 * @param guest - number (person who invited the campist)
 * @param registered_by - number (id of the gam member who carried out the registry)
 *
 * @returns an array with the new record
 * @tested true
 */
app.post("/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, AREA, ADMIN, GUEST, REGISTERED_BY, PHONE) VALUES (", ", ", ", ", ", ", ", ", ", ", ", 0, ", ", ", ", ", ") RETURNING *;"], ["INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, AREA, ADMIN, GUEST, REGISTERED_BY, PHONE) VALUES (", ", ", ", ", ", ", ", ", ", ", ", 0, ", ", ", ", ", ") RETURNING *;"])), req.body.name, req.body.type, req.body.document, req.body.age, req.body.transport, req.body.area, req.body.guest, req.body.registered_by, req.body.phone).then(function (response) {
                    res.statusCode = 200;
                    res.send(upperize(response[0]));
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Edit the user by ID
 * @param name - string
 * @param type - string
 * @param document - string
 * @param age - number
 * @param transport - 1 0
 * @param area - string
 * @param id - number
 * @param guest - number
 * @param phone - string
 * @returns an array with the record
 * @tested true
 */
app.put("/edit-user", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["UPDATE persons SET NAME=", ", DOCUMENT_TYPE=", ", DOCUMENT=", ", AGE=", ", TRANSPORT=", ", AREA=", ", GUEST=", ", PHONE=", " WHERE ID=", " RETURNING *;"], ["UPDATE persons SET NAME=", ", DOCUMENT_TYPE=", ", DOCUMENT=", ", AGE=", ", TRANSPORT=", ", AREA=", ", GUEST=", ", PHONE=", " WHERE ID=", " RETURNING *;"])), req.body.name, req.body.type, req.body.document, req.body.age, req.body.transport, req.body.area, req.body.guest, req.body.phone, req.query.id).then(function (response) {
                    res.statusCode = 200;
                    res.send(upperize(response[0]));
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Get the campist of all the area
 * @param area - string
 * @returns array of objects
 * @tested true
 */
app.get("/area", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["SELECT * FROM userview WHERE area = (SELECT name FROM areas WHERE abbr = ", ");"], ["SELECT * FROM userview WHERE area = (SELECT name FROM areas WHERE abbr = ", ");"])), req.query.area).then(function (response) {
                    res.statusCode = 200;
                    res.send(response);
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar estos registros. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Get all the relations of a camper
 * @param document - string
 * @param type - string
 * @returns array of objects
 * @tested true
 */
app.get("/relationships", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["SELECT * FROM userview WHERE (SELECT id FROM persons WHERE (document = ", " AND document_type= ", ")) = ANY (PARENT_RELATIONSHIP);"], ["SELECT * FROM userview WHERE (SELECT id FROM persons WHERE (document = ", " AND document_type= ", ")) = ANY (PARENT_RELATIONSHIP);"])), req.query.document, req.query.type).then(function (response) {
                    res.statusCode = 200;
                    res.send(response);
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar estos registros. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Add children to user
 * @param children - string[]
 * @param id - number
 * @returns array of objects updated
 * @tested true
 */
app.post("/relationships", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var where;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                where = req.body.children;
                return [4 /*yield*/, dBConnection.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["UPDATE persons SET parent_relationship = array_append(parent_relationship, ", ") WHERE id IN ", " RETURNING *;"], ["UPDATE persons SET parent_relationship = array_append(parent_relationship, ", ") WHERE id IN ", " RETURNING *;"])), +req.body.id, dBConnection.sql(where)).then(function (response) {
                        res.statusCode = 200;
                        res.send(response);
                    })
                        .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                        var errID;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, sendError(err)];
                                case 1:
                                    errID = _a.sent();
                                    res.statusCode = 409;
                                    res.send("Ocurri\u00F3 un error al intentar agregar a estos registros. ID del error: ".concat(errID));
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Remove children to user
 * @param children - string[]
 * @param id - number
 * @returns array of objects updated
 * @tested true
 */
app.put("/relationships", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var where;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                where = req.body.children;
                return [4 /*yield*/, dBConnection.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["UPDATE persons SET parent_relationship = array_remove(parent_relationship, ", ") WHERE id IN ", " RETURNING *;"], ["UPDATE persons SET parent_relationship = array_remove(parent_relationship, ", ") WHERE id IN ", " RETURNING *;"])), +req.body.id, dBConnection.sql(where)).then(function (response) {
                        res.statusCode = 200;
                        res.send(response);
                    })
                        .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                        var errID;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, sendError(err)];
                                case 1:
                                    errID = _a.sent();
                                    res.statusCode = 409;
                                    res.send("Ocurri\u00F3 un error al intentar eliminar a estos registros. ID del error: ".concat(errID));
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Delete user if he/she hasn't transactions (Is not recommended for use)
 * @param id - number
 * @returns an empty array
 * @tested true
 */
app.delete("/delete-user", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["DELETE FROM persons WHERE ID=", " AND (SELECT SUM(VALUE) FROM transactions WHERE transactions.\"userID\" = ", ") IS NULL RETURNING *;"], ["DELETE FROM persons WHERE ID=", " AND (SELECT SUM(VALUE) FROM transactions WHERE transactions.\"userID\" = ", ") IS NULL RETURNING *;"])), req.query.id, req.query.id).then(function (response) {
                    res.statusCode = 200;
                    res.send(response);
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Second login to admin user
 * @param password - string
 * @param document - string
 * @param type - string
 * @returns the data of the person connected
 * @tested true
 */
app.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["SELECT * FROM persons WHERE PASSWORD = ", " AND DOCUMENT = ", " AND DOCUMENT_TYPE = ", ";"], ["SELECT * FROM persons WHERE PASSWORD = ", " AND DOCUMENT = ", " AND DOCUMENT_TYPE = ", ";"])), req.body.password, req.body.document, req.body.type).then(function (response) {
                    res.statusCode = 200;
                    res.send(upperize(response[0]));
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Obtain all the fees and transport value
 * @return array of object
 * @tested true
 */
app.get("/fees", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        dBConnection.sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["SELECT * FROM fees"], ["SELECT * FROM fees"]))).then(function (response) {
            res.statusCode = 200;
            res.send(response.map(function (res) { return upperize(res); }));
        })
            .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
            var errID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sendError(err)];
                    case 1:
                        errID = _a.sent();
                        res.statusCode = 409;
                        res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
/**
 * See all users
 * @returns array of objects
 * @tested true
 */
app.get("/all-users", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["SELECT DOCUMENT_TYPE, DOCUMENT, NAME, AREA FROM persons;"], ["SELECT DOCUMENT_TYPE, DOCUMENT, NAME, AREA FROM persons;"]))).then(function (response) {
                    res.statusCode = 200;
                    res.send(response.map(function (res) { return upperize(res); }));
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Add a new transaction
 * @param value - number
 * @param type - string
 * @param document - string
 * @param authorizedBy - object
 *  @param type - stirng
 *  @param document - string
 * @param donation 1 0
 * @returns the record recently inserted
 * @tested true
 */
app.post("/payment", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["INSERT INTO transactions(DATE, VALUE, \"userID\", AUTHORIZED, DONATION, CONFIRMED) VALUES(NOW(), ", ", (SELECT ID FROM persons WHERE DOCUMENT_TYPE = ", " AND DOCUMENT = ", "), (SELECT ID FROM persons WHERE DOCUMENT_TYPE = ", " AND DOCUMENT = ", "), ", ", 0) RETURNING *;"], ["INSERT INTO transactions(DATE, VALUE, \"userID\", AUTHORIZED, DONATION, CONFIRMED) VALUES(NOW(), ", ", (SELECT ID FROM persons WHERE DOCUMENT_TYPE = ", " AND DOCUMENT = ", "), (SELECT ID FROM persons WHERE DOCUMENT_TYPE = ", " AND DOCUMENT = ", "), ", ", 0) RETURNING *;"])), req.body.value, req.body.type, req.body.document, req.body.authorizedBy.type, req.body.authorizedBy.document, req.body.donation).then(function (response) {
                    res.statusCode = 200;
                    res.send(upperize(response[0]));
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * See all transactions
 * @returns array of object
 * @tested true
 */
app.get("/transactions", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["SELECT * FROM transactionsView"], ["SELECT * FROM transactionsView"]))).then(function (response) {
                    res.statusCode = 200;
                    res.send(response.map(function (res) { return upperize(res); }));
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Return only the transactions of my group
 * @param id - number
 * @returns array of objects
 * @tested true
 */
app.get("/filtered-transactions", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["SELECT * FROM transactionsView t LEFT JOIN persons p ON t.\"userID\" = p.id WHERE (\"userID\" = ", " OR ", " = ANY (PARENT_RELATIONSHIP));"], ["SELECT * FROM transactionsView t LEFT JOIN persons p ON t.\"userID\" = p.id WHERE (\"userID\" = ", " OR ", " = ANY (PARENT_RELATIONSHIP));"])), req.query.id, req.query.id).then(function (response) {
                    res.statusCode = 200;
                    res.send(response.map(function (res) { return upperize(res); }));
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Edit a transaction value or donation status
 * @param id - number
 * @param value - number
 * @param donation - 1 0
 * @returns the recently edited record
 * @tested true
 */
app.put("/edit-transaction", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dBConnection.sql(templateObject_17 || (templateObject_17 = __makeTemplateObject(["UPDATE transactions SET VALUE = ", ", DONATION = ", " WHERE ID = ", " RETURNING *;"], ["UPDATE transactions SET VALUE = ", ", DONATION = ", " WHERE ID = ", " RETURNING *;"])), req.body.value, req.body.donation, req.query.id).then(function (response) {
                    res.statusCode = 200;
                    res.send(upperize(response[0]));
                })
                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                    var errID;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sendError(err)];
                            case 1:
                                errID = _a.sent();
                                res.statusCode = 409;
                                res.send("Ocurri\u00F3 un error al intentar consultar este Registro. ID del error: ".concat(errID));
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * Transaction approval by admin 2
 * @param ids - array of number
 * @returns array of object who changed
 * @tested true
 */
app.put("/transaction-approval", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        dBConnection.sql(templateObject_18 || (templateObject_18 = __makeTemplateObject(["UPDATE transactions SET confirmed = 1 WHERE ID IN ", " RETURNING *;"], ["UPDATE transactions SET confirmed = 1 WHERE ID IN ", " RETURNING *;"])), dBConnection.sql(req.body.ids)).then(function (response) {
            res.statusCode = 200;
            res.send(response.map(function (res) { return upperize(res); }));
        })
            .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
            var errID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sendError(err)];
                    case 1:
                        errID = _a.sent();
                        res.statusCode = 409;
                        res.send("Ocurri\u00F3 un error al intentar actualizar estos registros. ID del error: ".concat(errID));
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
/**
 * See all failures of the app
 * @param limit - number
 * @param skip - number
 * @tested true
 */
app.get("/failures", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        dBConnection.sql(templateObject_19 || (templateObject_19 = __makeTemplateObject(["SELECT * FROM failures \n    ORDER BY ID DESC \n    LIMIT ", " OFFSET ", ";"], ["SELECT * FROM failures \n    ORDER BY ID DESC \n    LIMIT ", " OFFSET ", ";"])), req.query.limit || 20, req.query.skip || 5).then(function (response) {
            res.statusCode = 200;
            res.send(response.map(function (res) { return upperize(res); }));
        })
            .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
            var errID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sendError(err)];
                    case 1:
                        errID = _a.sent();
                        res.statusCode = 409;
                        res.send("Ocurri\u00F3 un error al intentar consultar este registro. ID del error: ".concat(errID));
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
/**
 * Auxiliar function for transactions excel
 */
function getTransactions() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dBConnection.sql(templateObject_20 || (templateObject_20 = __makeTemplateObject(["SELECT * FROM transactionsview;"], ["SELECT * FROM transactionsview;"]))).then(function (resolve) {
                        return resolve;
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Export all transactions as an excel
 * @returns an excel file
 * @tested true
 */
app.get("/export-transactions", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var workbook, sheet_1, OBJECT, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                workbook = new exceljs_1.Workbook();
                sheet_1 = workbook.addWorksheet("transacciones");
                sheet_1.columns = [
                    { header: "Fecha", key: "date", width: 25 },
                    { header: "Tipo_Documento", key: "document_type", width: 10 },
                    { header: "Documento", key: "document", width: 12 },
                    { header: "Nombre", key: "name", width: 25 },
                    { header: "Valor", key: "value", width: 10 },
                    { header: "Autoriza", key: "authorized_by", width: 25 },
                    { header: "Donacion", key: "donation", width: 5 },
                    { header: "Confirmado", key: "confirmed", width: 5 }
                ];
                return [4 /*yield*/, getTransactions()];
            case 1:
                OBJECT = _a.sent();
                return [4 /*yield*/, OBJECT.map(function (value, index) {
                        sheet_1.addRow({
                            date: value.date,
                            document_type: value.document_type,
                            document: value.document,
                            name: value.name,
                            value: value.value,
                            authorized_by: value.authorized_by,
                            donation: value.donation === 1 ? "Sí" : "No",
                            confirmed: value.confirmed === 1 ? "Sí" : "No"
                        });
                    })];
            case 2:
                _a.sent();
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", "attachment;filename=" + "transacciones.xlsx");
                workbook.xlsx.write(res);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Auxiliar function for report excel
 */
function getReport() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dBConnection.sql(templateObject_21 || (templateObject_21 = __makeTemplateObject(["SELECT * FROM userview;"], ["SELECT * FROM userview;"]))).then(function (resolve) {
                        return resolve;
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Auxiliar function for report excel
 */
function getFees() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dBConnection.sql(templateObject_22 || (templateObject_22 = __makeTemplateObject(["SELECT * FROM fees"], ["SELECT * FROM fees"]))).then(function (resolve) {
                        return resolve;
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Auxiliar function for report excel
 */
function getCurrentFee(fees, age, transport) {
    var value = 0;
    if (age < 2) {
        return 0;
    }
    else if (age < 5) {
        value = +fees.filter(function (fee) { return fee.attribute === "TARIFA_NINO"; })[0].value;
    }
    else if (age < 12) {
        value = +fees.filter(function (fee) { return fee.attribute === "TARIFA_MENOR"; })[0].value;
    }
    else if (age >= 12) {
        value = +fees.filter(function (fee) { return fee.attribute === "TARIFA_COMPLETA"; })[0].value;
    }
    // Add transport
    if (transport) {
        value += +fees.filter(function (fee) { return fee.attribute === "TRANSPORT"; })[0].value;
    }
    return value;
}
/**
 * Export report in excel file
 * @returns an excel file
 * @tested true
 */
app.get("/export-report", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fees, workbook, sheet_2, OBJECT, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getFees()];
            case 1:
                fees = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 6]);
                workbook = new exceljs_1.Workbook();
                sheet_2 = workbook.addWorksheet("resumen");
                sheet_2.columns = [
                    { header: "Nombre", key: "name", width: 25 },
                    { header: "Edad", key: "age", width: 10 },
                    { header: "Celular", key: "phone", width: 12 },
                    { header: "Area", key: "area", width: 25 },
                    { header: "Invitado Por", key: "host", width: 10 },
                    { header: "Transporte", key: "transport", width: 25 },
                    { header: "Total Abonado", key: "total", width: 15 },
                    { header: "Total Meta", key: "goal", width: 15 },
                    { header: "Diferencia", key: "difference", width: 15 }
                ];
                return [4 /*yield*/, getReport()];
            case 3:
                OBJECT = _a.sent();
                return [4 /*yield*/, OBJECT.map(function (value, index) {
                        var goal = getCurrentFee(fees, value.age, value.transport === 1 ? true : false);
                        sheet_2.addRow({
                            name: value.name,
                            age: value.age,
                            phone: value.phone,
                            area: value.area,
                            host: value.invited,
                            transport: value.transport,
                            total: +value.balance,
                            goal: goal,
                            difference: goal - value.balance
                        });
                    })];
            case 4:
                _a.sent();
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", "attachment;filename=" + "reporte_general.xlsx");
                workbook.xlsx.write(res);
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error(error_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22;
