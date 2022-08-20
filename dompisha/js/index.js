window.addEventListener('DOMContentLoaded', () => {
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1280,
                    height: 720,
                    facingMode: {
                        exact: 'environment'
                    }
                },
                audio: false
            });
            document.getElementById('video');
        } catch (e) {
            console.log(e);
        }
    }
    startCamera();
});