document.addEventListener('DOMContentLoaded', () => {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFSdZkmu6Ri0y8cuMTFoVgTA0mhCD24yHm6HH7nRSLfCughrwdwbzx__MyY9-pVaX47Q/exec';
    const form = document.getElementById('solicitudForm');

    // --- Lógica para campos "Otro" ---
    const asesorSelect = document.getElementById('asesor');
    const otroAsesorInput = document.getElementById('otro_asesor');
    asesorSelect.addEventListener('change', function() {
        otroAsesorInput.style.display = (this.value === 'Otro') ? 'block' : 'none';
        otroAsesorInput.required = (this.value === 'Otro');
    });

    const fuenteSelect = document.getElementById('fuente');
    const otraFuenteInput = document.getElementById('otra_fuente');
    fuenteSelect.addEventListener('change', function() {
        otraFuenteInput.style.display = (this.value === 'Otro') ? 'block' : 'none';
        otraFuenteInput.required = (this.value === 'Otro');
    });

    // --- Lógica de Coordenadas ---
    const coordsBtn = document.getElementById('get-coords-btn');
    const coordsInput = document.getElementById('solicitud-coordenadas');
    coordsBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            coordsInput.value = 'Geolocalización no soportada.';
            return;
        }
        coordsInput.placeholder = 'Obteniendo coordenadas precisas...';
        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lon = position.coords.longitude.toFixed(6);
                coordsInput.value = `${lat},${lon}`;
            }, 
            (error) => { /* ... (manejo de errores) ... */ }, 
            options
        );
    });
    
    // --- Lógica de envío del formulario ---
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const formData = new FormData(form);
        if (formData.get('Asesor') === 'Otro') formData.set('Asesor', formData.get('otro_asesor'));
        if (formData.get('Fuente') === 'Otro') formData.set('Fuente', formData.get('otra_fuente'));
        
        const messageParts = [
            '*--- Nueva Solicitud de Servicio ---*', '',
            `*Fecha de Solicitud:* ${new Date(formData.get('Fecha') + 'T00:00:00').toLocaleDateString('es-ES')}`,
            `*Nombre y Apellido:* ${formData.get('Nombre')}`,
            `*Cédula:* ${formData.get('Cedula')}`,
            `*Contacto:* ${formData.get('Contacto')}`
        ];
        if (formData.get('Contacto2')) { messageParts.push(`*Contacto 2:* ${formData.get('Contacto2')}`); }
        messageParts.push(
            `*Ubicación:* ${formData.get('Ubicacion')}`, `*Municipio:* ${formData.get('Municipio')}`,
            `*Sector:* ${formData.get('Sector')}`, `*Calle/Avenida:* ${formData.get('Calle')}`, `*Casa/Edif:* ${formData.get('Casa')}`
        );
        
        const coordenadas = formData.get('Coordenadas');
        if (coordenadas) {
            // --- LÍNEA CORREGIDA ---
            messageParts.push(`*Coordenadas:* https://maps.google.com/?q=${coordenadas}`);
        }

        messageParts.push(
            `*Correo electrónico:* ${formData.get('Email')}`, `*Tipo de Servicio:* ${formData.get('Servicio')}`,
            `*Disponibilidad para instalación:* ${new Date(formData.get('Disponibilidad') + 'T00:00:00').toLocaleDateString('es-ES')}`,
            `*Asesor:* ${formData.get('Asesor')}`, `*Fuente:* ${formData.get('Fuente')}`
        );
        const message = messageParts.join('\n');
        const htmlPreview = message.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>');

        const whatsappTab = window.open('', '_blank');
        whatsappTab.document.write(`<html><head><title>Vista Previa</title><style>body{font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;}</style></head><body><h3>Revisa tu mensaje...</h3><p>${htmlPreview}</p><hr><p><i>Guardando datos y conectando con WhatsApp...</i></p></body></html>`);

        const submitButton = form.querySelector('button[type="submit"]');
        const statusMessage = document.getElementById('status-message');
        submitButton.disabled = true;
        submitButton.textContent = 'Guardando...';
        
        fetch(SCRIPT_URL, { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.result !== 'success') throw new Error(data.message);
                whatsappTab.location.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
                form.reset();
                statusMessage.className = 'status-message success';
                statusMessage.textContent = '¡Solicitud guardada con éxito!';
            })
            .catch(error => {
                whatsappTab.close();
                statusMessage.className = 'status-message error';
                statusMessage.textContent = `Error: ${error.message}`;
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Guardar y Enviar';
            });
    });
});
