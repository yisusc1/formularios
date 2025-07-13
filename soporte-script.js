document.addEventListener('DOMContentLoaded', () => {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFSdZkmu6Ri0y8cuMTFoVgTA0mhCD24yHm6HH7nRSLfCughrwdwbzx__MyY9-pVaX47Q/exec';

    const passwordContainer = document.getElementById('password-container');
    const formContainer = document.getElementById('form-container');
    const passwordForm = document.getElementById('password-form');
    
    const fechaInput = document.getElementById('soporte-fecha');
    const horaInput = document.getElementById('soporte-hora');
    const coordsBtn = document.getElementById('get-coords-btn');
    const coordsInput = document.getElementById('soporte-coordenadas');
    
    // --- LÓGICA DE CONTRASEÑA RESTAURADA ---
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (e.target.querySelector('input').value === '1111') {
            passwordContainer.style.display = 'none';
            formContainer.style.display = 'block';
            const now = new Date();
            fechaInput.value = now.toISOString().split('T')[0];
            horaInput.value = now.toTimeString().split(' ')[0].substring(0, 5);
        } else {
            document.getElementById('password-status').textContent = 'Clave incorrecta.';
        }
    });

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
            (error) => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        coordsInput.placeholder = "Permiso de ubicación denegado.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        coordsInput.placeholder = "Información de ubicación no disponible.";
                        break;
                    case error.TIMEOUT:
                        coordsInput.placeholder = "Se agotó el tiempo de espera.";
                        break;
                    default:
                        coordsInput.placeholder = "Error desconocido al obtener ubicación.";
                        break;
                }
            }, 
            options
        );
    });
    
    const form = document.getElementById('soporteForm');
    form.addEventListener('submit', e => {
        e.preventDefault();

        const formData = new FormData(form);
        const reporte = `*Reporte Técnico de Soporte:*\n\n` +
            `*Fecha:* ${formData.get('Fecha')}\n` +
            `*Hora:* ${formData.get('Hora')}\n` +
            `*Cliente:* ${formData.get('Cliente')}\n` +
            `*Precinto:* ${formData.get('Precinto')}\n` +
            `*Caja Nap:* ${formData.get('Caja Nap')}\n` +
            `*Coordenadas:* https://www.google.com/maps?q=${formData.get('Coordenadas')}\n` +
            `*Cantidad de Puertos:* ${formData.get('Cantidad de Puertos')}\n` +
            `*Puerto cliente:* ${formData.get('Puerto cliente')}\n` +
            `*Potencia:* ${formData.get('Potencia')}\n` +
            `*Zona:* ${formData.get('Zona')}\n` +
            `*Estatus:* ${formData.get('Estatus')}\n` +
            `*Causa:* ${formData.get('Causa')}\n` +
            `*Acción Realizada:* ${formData.get('Accion Realizada')}\n` +
            `*Conectores utilizados:* ${formData.get('Conectores utilizados')}\n` +
            `*Metraje utilizado:* ${formData.get('Metraje utilizado')}\n` +
            `*Observaciones Adicionales:* ${formData.get('Observaciones Adicionales')}\n` +
            `*Realizado por:* ${formData.get('Realizado por')}`;
        
        const htmlPreview = reporte.replace(/\n/g, '<br>').replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank">$1</a>'
        );

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
                
                whatsappTab.location.href = `https://wa.me/?text=${encodeURIComponent(reporte)}`;
                
                form.reset();
                const now = new Date();
                fechaInput.value = now.toISOString().split('T')[0];
                horaInput.value = now.toTimeString().split(' ')[0].substring(0, 5);
                statusMessage.className = 'status-message success';
                statusMessage.textContent = '¡Reporte guardado con éxito!';
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
