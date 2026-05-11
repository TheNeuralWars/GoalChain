document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll
    const cards = document.querySelectorAll('.glass-card');
    
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.8s ease-out';
        observer.observe(card);
    });

    // Countdown Logic
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14); // 14 days from now

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Form submission simulation
    const form = document.querySelector('form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = '¡REGISTRADO! 🚀';
            btn.style.background = '#9945ff';
            btn.disabled = true;
            
            setTimeout(() => {
                form.reset();
                btn.innerText = originalText;
                btn.style.background = 'var(--primary)';
                btn.disabled = false;
            }, 3000);
        });
    }
});
