/* Carta de Pepe Cangrejo. Para editar: cambia nombre, precio o nota ("" si no hay).
   Formato de cada plato: [nombre, precio, nota].
   "img": foto referencial de la página; cámbiala por una foto propia (p. ej. "img/ceviche.jpg"). */
const MENU = [
  { id: "cangri", title: "Cangri Lover's", img: "https://images.unsplash.com/photo-1615719413546-198b25453f85?auto=format&fit=crop&w=900&q=75", sub: "Nuestra especialidad: la pulpa de cangrejo", items: [
    ["Causa de pulpa de cangrejo", 45, ""], ["Cangrileche", 40, ""], ["Uñas de cangrejo al panko", 80, ""],
    ["Ceviche de uñas de cangrejo", 80, ""], ["Chupe de cangrejo", 50, ""], ["Chilcano de cangrejo", 25, ""],
    ["Tequeños de pulpa de cangrejo", 50, ""], ["Sudado de cangrejo", 60, ""], ["Wantan oriental de pulpa de cangrejo", 45, ""] ]},
  { id: "entradas", title: "Entradas", img: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=900&q=75", sub: "Frescura para comenzar", items: [
    ["Ceviche Mixto", 60, "Calamar, langostinos, pescado y pulpo"], ["Ceviche Tradicional", 45, ""], ["Ceviche Anconero", 65, ""],
    ["Ceviche de Pulpo", 70, ""], ["Ceviche o Tiradito de Lenguado", 60, ""], ["Conchas a la Parmesana", 50, ""],
    ["Conchas a la Chalaca", 40, ""], ["Leche de Tigre", 25, ""], ["Leche de Tigre Carretillera", 40, ""],
    ["Langostinos al Panko", 75, ""], ["Coctel de Langostinos", 35, ""], ["Pulpo al Olivo", 60, ""], ["Causa Olivada", 45, ""] ]},
  { id: "fondos-marinos", title: "Fondos Marinos", img: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=900&q=75", sub: "Del mar directo a tu mesa", items: [
    ["Duo Marino", 65, "Ceviche y arroz c/ mariscos"], ["Causa Acevichada", 65, ""], ["Mixto Pepe", 65, "Ceviche y chicharrón"],
    ["Trio Marino", 65, ""], ["Mostro Marino", 65, ""], ["Filete de Lenguado a la Menier", 70, ""],
    ["Lenguado Entero a lo Macho", 80, ""], ["Pulpo Anticuchero", 65, ""], ["Chicharrón de Pescado", 60, ""],
    ["Chicharrón de Calamar o Pulpo", 65, ""], ["Chicharrón de Lenguado", 70, ""], ["Chicharrón de Langostinos", 70, ""],
    ["Pescado Crocante", 65, "Pintadilla / Cabrilla"], ["Pescado Crocante", 80, "Lenguado / Chita / Corvina"],
    ["Jalea Mixta", 100, ""], ["Milanesa de Pescado al Panko", 50, ""] ]},
  { id: "especiales", title: "Especiales", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=75", sub: "Los sabores de la casa", items: [
    ["Saltado de Mariscos", 65, ""], ["Saltado de Lapa", 60, ""], ["Saltado de Pulpo", 50, ""],
    ["Saltado de Pescado", 60, ""], ["Cau Cau de Mariscos", 60, ""], ["Cau Cau de Caracol", 50, ""] ]},
  { id: "pastas", title: "Arroces y Pastas", img: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=75", sub: "Arroces y pastas con sabor a mar", items: [
    ["Arroz c/ Mariscos Arrizotado", 65, ""], ["Arroz c/ Mariscos Criollo", 60, ""], ["Arroz c/ Langostinos Arrizotado", 65, ""],
    ["Chaufa de Mariscos o Pescado", 50, ""], ["Fetuccini c/ Langostinos al Vino", 65, ""],
    ["Fetuccini a la Huancaina", 50, "c/ Milanesa de Pescado"], ["Fetuccini c/ Langostinos", 60, "en Salsa Blanca"] ]},
  { id: "sopas", title: "Sopas y Chupes", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=75", sub: "El calor del mar en cada plato", items: [
    ["Parihuela Pepe Cangrejo", 80, ""], ["Sudado de Pescado", 65, "Pesca del día"],
    ["Chupe de Pescado o Langostinos", 50, ""], ["Chilcano Especial", 25, "Pescado entero"] ]},
  { id: "criollos", title: "Fondos Criollos", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=75", sub: "El sabor criollo de siempre", items: [
    ["Lomo Fino Saltado", 50, ""], ["Pollo Saltado", 40, ""], ["Chaufa Lomo", 50, "Lomo fino"],
    ["Fetuccini a la Huancaína", 50, "c/ Lomo Saltado"], ["Milanesa de Pollo al Panko c/ Papas", 45, ""],
    ["Chicharrón de Pollo", 40, ""], ["Fetuccini en Salsa Blanca", 45, "c/ Milanesa de Pollo"] ]},
  { id: "bebidas", title: "Bebidas", img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=75", sub: "Para acompañar tu mesa", items: [
    ["Chicha Morada o Maracuyá 1 LT", 23, ""], ["Limonada 1 LT", 23, ""], ["Limonada Frozen 1 LT", 25, ""],
    ["Inka Cola / Coca Cola 1 LT", 12, ""], ["Inka Cola / Coca Cola 1.5 LT", 17, ""], ["Inka Cola / Coca Cola 1/2 LT", 8, ""],
    ["Cerveza Pilsen", 10, ""], ["Cerveza Cuzqueña Trigo/Negra", 13, ""], ["Heineken / Corona / Stella Artois", 15, ""],
    ["Agua Mineral con Gas o sin Gas", 6, ""] ]},
  { id: "tragos", title: "Tragos y Cocteles", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=75", sub: "Clásicos peruanos y de barra", items: [
    ["Piña Colada / Cuba Libre", 30, ""], ["Chilcano / Pisco Sour / Maracuyá Sour", 30, ""],
    ["Daikiri de Durazno o Maracuyá", 30, ""], ["Sangría de la Casa 1 LT", 50, ""],
    ["Botella de Vino de la Casa Intipalka", 70, ""] ]},
  { id: "guarniciones", title: "Guarniciones", img: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=75", sub: "El complemento perfecto", items: [
    ["Porción de Arroz Blanco", 6, ""], ["Porción de Papas Fritas Amarillas", 12, ""], ["Porción de Yucas Fritas", 12, ""],
    ["Porción de Camote y Choclo", 10, ""], ["Porción de Chifle", 7, ""], ["Porción de Yuca Sancochada", 10, ""] ]}
];

/* Platos marcados con ★ en la carta (los mismos de la sección "Platos Estrella") */
const ESTRELLA = ["Causa de pulpa de cangrejo", "Ceviche Anconero", "Parihuela Pepe Cangrejo", "Jalea Mixta"];
