let peer;
let myStream;
let myVideoTrack;
let myAudioTrack;
let isMuted = false;
let isVideoMuted = false;

// Fonction pour ajouter une vidéo à l'écran
function ajoutVideo(stream, id) {
    try {
        const video = document.createElement('video');
        video.autoplay = true;
        video.controls = true;
        video.srcObject = stream;
        video.id = id; // Associe l'ID pour éviter les doublons
        document.getElementById('participants').appendChild(video);
    } catch (error) {
        console.error("Erreur lors de l'ajout de la vidéo :", error);
    }
}

// Fonction pour enregistrer un utilisateur (initialisation de PeerJS)
function register() {
    const name = document.getElementById('name').value;
    try {
        peer = new Peer(name);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                myStream = stream;
                myVideoTrack = stream.getVideoTracks()[0];
                myAudioTrack = stream.getAudioTracks()[0];

                ajoutVideo(stream, 'me'); // Affiche la vidéo de l'utilisateur local

                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';

                peer.on('call', (call) => {
                    call.answer(myStream);
                    call.on('stream', (remoteStream) => {
                        ajoutVideo(remoteStream, call.peer); // Affiche la vidéo de l'utilisateur appelant
                    });
                });
            })
            .catch((err) => {
                console.error("Échec de l'accès au flux local :", err);
            });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
    }
}

// Fonction pour appeler un utilisateur
function appelUser() {
    const name = document.getElementById('add').value;
    document.getElementById('add').value = ""; // Vide le champ après l'appel

    try {
        const call = peer.call(name, myStream);
        call.on('stream', (remoteStream) => {
            ajoutVideo(remoteStream, name);  // Affiche la vidéo de l'autre utilisateur
        });
    } catch (error) {
        console.error("Erreur lors de l'appel :", error);
    }
}

// Fonction pour partager son écran
function addScreenShare() {
    const name = document.getElementById('share').value;
    document.getElementById('share').value = ""; // Vide le champ après le partage d'écran

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
            const call = peer.call(name, stream);
            call.on('stream', (remoteStream) => {
                ajoutVideo(remoteStream, name);  // Affiche la vidéo de l'autre utilisateur
            });
        })
        .catch((err) => {
            console.error("Erreur lors du partage d'écran :", err);
        });
}

// Fonction pour couper/activer le micro
function toggleMute() {
    if (isMuted) {
        myAudioTrack.enabled = true;
        isMuted = false;
        document.getElementById('muteButton').textContent = "Mute";
    } else {
        myAudioTrack.enabled = false;
        isMuted = true;
        document.getElementById('muteButton').textContent = "Unmute";
    }
}

// Fonction pour couper/activer la vidéo
function toggleVideo() {
    if (isVideoMuted) {
        myVideoTrack.enabled = true;
        isVideoMuted = false;
        document.getElementById('videoButton').textContent = "Turn off Video";
    } else {
        myVideoTrack.enabled = false;
        isVideoMuted = true;
        document.getElementById('videoButton').textContent = "Turn on Video";
    }
}
