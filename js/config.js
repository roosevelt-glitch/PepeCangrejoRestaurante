/* Configuración del negocio: cambia estos datos para personalizar la web.
   (Si cambias el teléfono, actualiza también el texto visible y el bloque JSON-LD en index.html;
   los enlaces de WhatsApp y los números en pantalla se corrigen solos desde aquí.) */
const CONFIG = {
  name: "Pepe Cangrejo",
  phone: "51957816255",        // WhatsApp con código de país, sin + ni espacios
  phoneLabel: "+51 957 816 255", // cómo se muestra el número en pantalla
  open: 11,                    // hora de apertura (formato 24 h)
  close: 18,                   // hora de cierre (formato 24 h)
  tz: "America/Lima",

  /* Reglas del formulario de reservas */
  slotMinutes: 30,             // cada cuántos minutos se ofrece una hora
  lastBookingBeforeClose: 30,  // la última reserva es 30 min antes de cerrar (17:30)
  minLeadMinutes: 30,          // anticipación mínima para reservar el mismo día
  bookDaysAhead: 60            // hasta cuántos días adelante se puede reservar
};
