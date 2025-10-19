// Éléments DOM
const linkInput = document.getElementById('linkInput');
const generateBtn = document.getElementById('generateBtn');
const qrCanvas = document.getElementById('qrCanvas');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const actionButtons = document.getElementById('actionButtons');

// Variable pour stocker le QR code
let currentQRCode = null;
let currentLink = '';

// Fonction pour nettoyer le nom de fichier
function sanitizeFilename(url) {
    return url
        .replace(/^https?:\/\//, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50);
}

// Fonction pour générer le QR code
function generateQRCode() {
    const link = linkInput.value.trim();

    if (!link) {
        alert('Veuillez entrer un lien');
        return;
    }

    currentLink = link;

    // Nettoyer le conteneur
    const container = qrCanvas.parentElement;
    container.innerHTML = '<div id="qrcode"></div>';

    // Créer le QR code avec la librairie QRCode.js
    const qrcode = new QRCode(document.getElementById('qrcode'), {
        text: link,
        width: 512,
        height: 512,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // Attendre que l'image soit générée
    setTimeout(() => {
        const img = document.querySelector('#qrcode img');
        if (img) {
            // Créer un canvas avec l'image
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            img.onload = function() {
                ctx.drawImage(img, 0, 0, 512, 512);
                currentQRCode = canvas;
                actionButtons.style.display = 'flex';
            };

            // Si l'image est déjà chargée
            if (img.complete) {
                ctx.drawImage(img, 0, 0, 512, 512);
                currentQRCode = canvas;
                actionButtons.style.display = 'flex';
            }
        }
    }, 100);
}

// Fonction pour copier dans le presse-papiers
async function copyToClipboard() {
    if (!currentQRCode) {
        alert('Veuillez d\'abord générer un QR code');
        return;
    }

    try {
        currentQRCode.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);
                alert('QR Code copié dans le presse-papiers !');
            } catch (err) {
                console.error('Erreur lors de la copie:', err);
                alert('Erreur lors de la copie dans le presse-papiers');
            }
        });
    } catch (err) {
        console.error('Erreur:', err);
        alert('Votre navigateur ne supporte pas cette fonctionnalité');
    }
}

// Fonction pour télécharger en JPG
function downloadAsJPG() {
    if (!currentQRCode) {
        alert('Veuillez d\'abord générer un QR code');
        return;
    }

    // Créer un nouveau canvas pour le JPG (fond blanc)
    const jpgCanvas = document.createElement('canvas');
    jpgCanvas.width = 512;
    jpgCanvas.height = 512;
    const ctx = jpgCanvas.getContext('2d');

    // Remplir avec un fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);

    // Dessiner le QR code
    ctx.drawImage(currentQRCode, 0, 0);

    // Convertir en JPG et télécharger
    jpgCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sanitizeFilename(currentLink) + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
}

// Événements
generateBtn.addEventListener('click', generateQRCode);
linkInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateQRCode();
    }
});
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadAsJPG);
