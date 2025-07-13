document.addEventListener('DOMContentLoaded', () => {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFSdZkmu6Ri0y8cuMTFoVgTA0mhCD24yHm6HH7nRSLfCughrwdwbzx__MyY9-pVaX47Q/exec';
    
    const passwordContainer = document.getElementById('password-container');
    const formContainer = document.getElementById('form-container');
    const passwordForm = document.getElementById('password-form');
    
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (e.target.querySelector('input').value === '0000') {
            passwordContainer.style.display = 'none';
            formContainer.style.display = 'block';
        } else {
            document.getElementById('password-status').textContent = 'Clave incorrecta.';
        }
    });
    
    const form = document.getElementById('reporteForm');
    form.addEventListener('submit', e => {
        e.preventDefault();

        // 1. Abrir la pestaña en blanco INMEDIATAMENTE
        const whatsappTab = window.open('', '_blank');
        whatsappTab.document.write('Conectando con WhatsApp, por favor espera...');

        const submitButton = form.querySelector('button[type="submit"]');
        const statusMessage = document.getElementById('status-message');
        submitButton.disabled = true;
        submitButton.textContent = 'Guardando...';
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';

        fetch(SCRIPT_URL, { method: 'POST', body: new FormData(form)})
            .then(response => response.json())
            .then(data => {
                if (data.result !== 'success') throw new Error(data.message || 'Error desconocido del script.');

                const formData = new FormData(form);
                const reporte = `*Reporte De instalación:*\n*Fecha:* ${formData.get('Fecha')}\n*Hora:* ${formData.get('Hora')}\n*Equipo:* ${formData.get('Equipo') || 'N/A'}\n*Cliente:* ${formData.get('Cliente') || 'N/A'}\n*SI Asignado:* ${formData.get('SI Asignado') || 'N/A'}\n*PW Asignado:* ${formData.get('PW Asignado') || 'N/A'}\n*Precinto:* ${formData.get('Precinto') || 'N/A'}\n*ONU PON:* ${formData.get('ONU PON') || 'N/A'}\n*Router:* ${formData.get('Router') || 'N/A'}\n*MAC:* ${formData.get('MAC') || 'N/A'}\n*Instalación:* ${formData.get('Instalación') || 'N/A'}\n*PLAN:* ${formData.get('PLAN') || 'N/A'}\n*V. descarga:* ${formData.get('V. descarga') || 'N/A'}\n*V. Subida:* ${formData.get('V. Subida') || 'N/A'}\n*Potencia NAP:* ${formData.get('Potencia NAP') || 'N/A'}\n*Potencia Cliente:* ${formData.get('Potencia Cliente') || 'N/A'}\n*Metraje utilizado:* ${formData.get('Metraje utilizado') || 'N/A'}\n*Metraje desechado:* ${formData.get('Metraje desechado') || 'N/A'}\n*Técnico 1:* ${formData.get('Técnico 1') || 'N/A'}\n*Técnico 2:* ${formData.get('Técnico 2') || 'N/A'}`;
                
                // 2. Cargar la URL en la pestaña ya abierta
                whatsappTab.location.href = `https://wa.me/?text=${encodeURIComponent(reporte)}`;
                
                form.reset();
                statusMessage.className = 'status-message success';
                statusMessage.textContent = '¡Reporte guardado con éxito!';
            })
            .catch(error => {
                // 3. Cerrar la pestaña si hay un error
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
