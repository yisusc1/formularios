document.addEventListener('DOMContentLoaded', () => {
    const SCRIPT_URL = 'URL_DE_TU_SCRIPT_IMPLEMENTADO'; // <-- USA LA MISMA URL QUE EN LOS OTROS SCRIPTS
    const form = document.getElementById('planificacionForm');
    const pendingListContainer = document.getElementById('pending-list-container');
    const loadingMessage = document.getElementById('loading-message');

    // 1. Cargar las solicitudes pendientes al abrir la página
    google.script.run
        .withSuccessHandler(displayPendingInstallations)
        .withFailureHandler(error => {
            loadingMessage.textContent = 'Error al cargar las solicitudes. ' + error;
            loadingMessage.style.color = '#dc3545';
        })
        .getPendingInstallations();

    // 2. Función para mostrar las solicitudes en el HTML
    function displayPendingInstallations(installations) {
        loadingMessage.style.display = 'none';
        if (installations.length === 0) {
            pendingListContainer.innerHTML = '<p>No hay solicitudes pendientes por asignar.</p>';
            return;
        }

        let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
        installations.forEach(inst => {
            html += `
                <li style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                    <label style="display: flex; align-items: center; gap: 1rem; font-weight: normal; font-size: 1rem;">
                        <input type="checkbox" name="solicitud" value="${inst.id}" style="width: auto;">
                        <strong>${inst.cliente}</strong> - ${inst.sector}
                    </label>
                </li>
            `;
        });
        html += '</ul>';
        pendingListContainer.innerHTML = html;
    }

    // 3. Lógica de envío del formulario
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const checkedBoxes = form.querySelectorAll('input[name="solicitud"]:checked');
        if (checkedBoxes.length === 0) {
            alert('Debes seleccionar al menos una solicitud para planificar.');
            return;
        }

        const idsSeleccionadas = Array.from(checkedBoxes).map(cb => cb.value);

        const formData = {
            formType: 'planificacion',
            fecha_asignada: document.getElementById('fecha-asignada').value,
            equipo_asignado: document.getElementById('equipo-asignado').value,
            ids_solicitudes: idsSeleccionadas.join(',')
        };

        const submitButton = form.querySelector('button[type="submit"]');
        const statusMessage = document.getElementById('status-message');
        
        submitButton.disabled = true;
        submitButton.textContent = 'Guardando...';

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Importante para Google Scripts cuando no se maneja la respuesta directa
            redirect: 'follow',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData)
        })
        .then(() => {
            statusMessage.className = 'status-message success';
            statusMessage.textContent = '¡Planificación guardada con éxito! La página se recargará.';
            setTimeout(() => location.reload(), 2000);
        })
        .catch(error => {
            statusMessage.className = 'status-message error';
            statusMessage.textContent = `Error: ${error.message}`;
            submitButton.disabled = false;
            submitButton.textContent = 'Guardar Planificación';
        });
    });
});
