document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = uploadProgress.querySelector('.progress');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoList = document.getElementById('videoList');

    // Video listesini localStorage'dan yükle
    let videos = JSON.parse(localStorage.getItem('videos')) || [];
    renderVideoList();

    // Drag & Drop olayları
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'transparent';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Dosya seçimi olayı
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        const file = files[0];
        if (!file || !file.type.startsWith('video/')) {
            alert('Lütfen geçerli bir video dosyası seçin!');
            return;
        }

        // Dosya boyutu kontrolü (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
            alert('Video dosyası 100MB\'dan küçük olmalıdır!');
            return;
        }

        uploadProgress.style.display = 'block';
        const reader = new FileReader();

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                progressBar.style.width = progress + '%';
            }
        };

        reader.onload = (e) => {
            const videoData = {
                id: Date.now(),
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                timestamp: new Date().toISOString()
            };

            videos.unshift(videoData);
            localStorage.setItem('videos', JSON.stringify(videos));
            renderVideoList();
            uploadProgress.style.display = 'none';
            progressBar.style.width = '0%';
        };

        reader.readAsDataURL(file);
    }

    function renderVideoList() {
        videoList.innerHTML = '';
        videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <div class="video-item-info">
                    <div class="video-item-title">${video.name}</div>
                    <div class="video-item-size">${formatSize(video.size)}</div>
                    <div class="video-item-date">${formatDate(video.timestamp)}</div>
                </div>
            `;
            videoItem.addEventListener('click', () => playVideo(video));
            videoList.appendChild(videoItem);
        });
    }

    function playVideo(video) {
        videoPlayer.src = video.data;
        videoPlayer.play();
    }

    function formatSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});
