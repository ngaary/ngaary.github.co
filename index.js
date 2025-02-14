let peer;
let myStream;
let currentCall;

// Fonction pour ajouter ou remplacer une vidéo
function ajoutVideo(stream, id) {
    let existingVideo = document.getElementById(id);
    if (!existingVideo) {
        const video = document.createElement('video');
        video.id = id;
        video.autoplay = true;
        video.controls = true;
        document.getElementById('participants').appendChild(video);
    }
    document.getElementById(id).srcObject = stream;
}

// Fonction pour enregistrer un utilisateur
function register() {
    const name = document.getElementById('name').value;
    try {
        peer = new Peer(name);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                myStream = stream;
                ajoutVideo(myStream, "myVideo");

                // Masquer le formulaire d'enregistrement et afficher les autres options
                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';

                // Répondre aux appels entrants
                peer.on('call', (call) => {
                    call.answer(myStream);
                    currentCall = call;
                    call.on('stream', (remoteStream) => {
                        ajoutVideo(remoteStream, "remoteVideo");
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
    try {
        const name = document.getElementById('add').value;
        document.getElementById('add').value = "";
        const call = peer.call(name, myStream);
        currentCall = call;
        call.on('stream', (remoteStream) => {
            ajoutVideo(remoteStream, "remoteVideo");
        });
    } catch (error) {
        console.error("Erreur lors de l'appel :", error);
    }
}

// Fonction pour partager son écran
function addScreenShare() {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        .then((stream) => {
            // Remplace la vidéo de la caméra par le partage d'écran
            ajoutVideo(stream, "myVideo");

            if (currentCall) {
                currentCall.peerConnection.getSenders().forEach((sender) => {
                    if (sender.track.kind === "video") {
                        sender.replaceTrack(stream.getVideoTracks()[0]);
                    }
                });
            }

            stream.getVideoTracks()[0].onended = () => {
                // Revenir à la caméra normale après le partage d'écran
                ajoutVideo(myStream, "myVideo");
                if (currentCall) {
                    currentCall.peerConnection.getSenders().forEach((sender) => {
                        if (sender.track.kind === "video") {
                            sender.replaceTrack(myStream.getVideoTracks()[0]);
                        }
                    });
                }
            };
        })
        .catch((err) => {
            console.error("Erreur lors du partage d'écran :", err);
        });
}
