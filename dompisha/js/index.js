window.addEventListener('DOMContentLoaded', () => {
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    height: 1280,
                    width: 720,
                    facingMode: {
                        exact: 'environment'
                    }
                },
                audio: false
            });
            document.getElementById('video').srcObject = stream;
            alert('nya-');
        } catch (e) {
            console.log(e);
        }
    }
    startCamera();
});