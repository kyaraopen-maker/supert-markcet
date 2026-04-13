window.addEventListener("load", () => {
    // --- CONFIGURATION ---
    const apiURL = "https://usebasin.com/f/3fd0997eec54"; 
    
    const catalogue = { 
        "lait": "1 500 FCFA", 
        "pain": "250 FCFA", 
        "riz": "12 000 FCFA", 
        "sucre": "800 FCFA" 
    };
    let monPanier = [];
    let articleEnCours = null;

    // --- ÉLÉMENTS DOM ---
    const sectionCommande = document.getElementById('commande-section');
    const sectionPanier = document.getElementById('panier-section');
    const actionPanierZone = document.getElementById('action-panier-zone');
    const formLivraison = document.getElementById('form-livraison');
    const inputArticleManuel = document.getElementById('article-manuel');
    const searchInput = document.getElementById('user-search');

    // ==========================================
    // 1. ANIMATIONS AU CHARGEMENT
    // ==========================================
    const animIntro = () => {
        document.querySelector('.brand-section').animate([
            { opacity: 0, transform: 'translateX(-50px)' },
            { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 800, easing: 'ease-out' });

        document.querySelector('.chips-img').animate([
            { opacity: 0, transform: 'scale(0.8) rotate(-5deg)' },
            { opacity: 1, transform: 'scale(1) rotate(0deg)' }
        ], { duration: 1000, delay: 200, easing: 'ease-out', fill: 'both' });

        document.querySelector('.main-actions').animate([
            { opacity: 0, transform: 'translateY(30px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 600, delay: 500, easing: 'ease-out', fill: 'both' });
    };

    animIntro();

    // ==========================================
    // 2. FONCTIONS DE NAVIGATION (MODALES)
    // ==========================================
    function transitionEntrante(cible) {
        cible.style.display = 'flex';
        cible.animate([
            { opacity: 0, backdropFilter: "blur(0px)" },
            { opacity: 1, backdropFilter: "blur(12px)" }
        ], { duration: 400, fill: 'forwards' });

        const contenu = cible.querySelector('.modal-content');
        if (contenu) {
            contenu.animate([
                { transform: 'scale(0.7) translateY(50px)', opacity: 0 },
                { transform: 'scale(1) translateY(0)', opacity: 1 }
            ], { duration: 500, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' });
        }
    }

    function fermerModal(cible) {
        if (!cible) return;
        const anim = cible.animate([
            { opacity: 1, backdropFilter: "blur(12px)" },
            { opacity: 0, backdropFilter: "blur(0px)" }
        ], { duration: 300 });
        anim.onfinish = () => { cible.style.display = 'none'; };
    }

    function ouvrirFormulaireDirect(preRemplissage = "") {
        document.getElementById('modal-title').innerText = "📍 Finaliser la Commande";
        document.getElementById('modal-details').innerText = "Veuillez remplir vos informations.";
        inputArticleManuel.value = preRemplissage;
        
        actionPanierZone.style.display = 'none';
        formLivraison.style.display = 'block';
        transitionEntrante(sectionCommande);
    }

    // --- LOGIQUE DE RECHERCHE ---
    document.querySelector('.search-form-container').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = searchInput.value.toLowerCase().trim();
        if (catalogue[val]) {
            articleEnCours = { nom: val, prix: catalogue[val] };
            document.getElementById('modal-title').innerText = "Article trouvé !";
            document.getElementById('modal-details').innerText = `${val.toUpperCase()} : ${catalogue[val]}`;
            
            actionPanierZone.style.display = 'block';
            formLivraison.style.display = 'none';
            transitionEntrante(sectionCommande);
        } else if (val !== "") {
            ouvrirFormulaireDirect(val);
        }
    });

    // ==========================================
    // 3. ENVOI DE LA COMMANDE
    // ==========================================
    formLivraison.addEventListener('submit', (e) => {
        e.preventDefault();
        const btnConfirm = e.target.querySelector('button[type="submit"]');
        
        btnConfirm.animate([{ transform: "scale(1)" }, { transform: "scale(0.9)" }, { transform: "scale(1)" }], { duration: 150 });

        const originalText = btnConfirm.innerText;
        btnConfirm.innerText = "Envoi en cours...";
        btnConfirm.disabled = true;

        const formData = new FormData(formLivraison);

        fetch(apiURL, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (!response.ok) throw new Error("Erreur Basin");
            alert("✅ Commande reçue ! Votre agence HIRAM vous contactera.");
            fermerModal(sectionCommande);
            e.target.reset();
            searchInput.value = "";
            monPanier = []; 
        })
        .catch(error => {
            alert("❌ Erreur d'envoi. Vérifiez votre connexion.");
            console.error(error);
        })
        .finally(() => {
            btnConfirm.innerText = originalText;
            btnConfirm.disabled = false;
        });
    });

    // ==========================================
    // 4. GESTION DU PANIER & CALCUL DU TOTAL
    // ==========================================
    document.getElementById('btn-sortir-recherche').addEventListener('click', () => fermerModal(sectionCommande));
    document.getElementById('btn-sortir-commande').addEventListener('click', () => fermerModal(sectionCommande));

    document.getElementById('btn-ajouter-panier').addEventListener('click', () => {
        if (articleEnCours) {
            monPanier.push(articleEnCours);
            alert(`✅ ${articleEnCours.nom} ajouté !`);
            fermerModal(sectionCommande);
        }
    });

    document.getElementById('open-panier').addEventListener('click', () => {
        const liste = document.getElementById('liste-panier');
        
        if (monPanier.length === 0) {
            liste.innerHTML = "<p>Panier vide.</p>";
        } else {
            let total = 0;
            
            // Génération de la liste des articles avec leurs prix respectifs
            let html = monPanier.map(i => {
                // On nettoie le prix pour ne garder que les chiffres (ex: "1 500 FCFA" -> 1500)
                const prixNet = parseInt(i.prix.replace(/[^0-9]/g, ""));
                total += prixNet;

                return `<p style='border-bottom:1px solid #eee; padding:10px; display:flex; justify-content:space-between;'>
                            <span>• ${i.nom.toUpperCase()}</span>
                            <span style='font-weight:bold; color:#27ae60;'>${i.prix}</span>
                        </p>`;
            }).join('');

            // Ajout du bloc Total stylisé en bas
            html += `
                <div style="margin-top: 20px; padding: 15px; background: #fff9e6; border-radius: 10px; border: 2px dashed #ffcc00; text-align: center;">
                    <span style="font-size: 1rem; font-weight: bold; color: #333;">TOTAL À PAYER :</span><br>
                    <span style="font-size: 1.4rem; color: #e67e22; font-weight: 900;">${total.toLocaleString('fr-FR')} FCFA</span>
                </div>
            `;
            
            liste.innerHTML = html;
        }
        transitionEntrante(sectionPanier);
    });

    document.getElementById('btn-passer-paiement').addEventListener('click', () => {
        if (monPanier.length > 0) {
            const resume = monPanier.map(i => i.nom.toUpperCase()).join(", ");
            fermerModal(sectionPanier);
            setTimeout(() => ouvrirFormulaireDirect(resume), 300);
        }
    });

    document.getElementById('open-commande').addEventListener('click', () => ouvrirFormulaireDirect());
    document.getElementById('open-commande-hero').addEventListener('click', () => ouvrirFormulaireDirect());

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => fermerModal(e.target.closest('.modal-section')));
    });
});



window.addEventListener('DOMContentLoaded', () => {
    const badge = document.getElementById('badge-trynity');
    const closeBtn = document.getElementById('close-badge');

    if (badge) {
        // Apparition après 10 secondes
        setTimeout(() => {
            badge.classList.remove('hidden');
            badge.classList.add('active');
        }, 10000);

        // Disparition après 1 minute (70s total)
        setTimeout(() => {
            badge.classList.add('hidden');
        }, 70000);

        // Fermeture manuelle
        closeBtn.addEventListener('click', () => {
            badge.classList.add('hidden');
        });
    }
});