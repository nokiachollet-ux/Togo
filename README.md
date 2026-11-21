# Les Mains de l'Espérance Internationale — site vitrine

Site statique (HTML, CSS, JavaScript) de l'association humanitaire et solidaire
**Les Mains de l'Espérance Internationale**.

- **Contenu** (textes, logo, visuels) : repris de [lesmainsdelesperance.fr](https://lesmainsdelesperance.fr).
- **Nouvelle charte graphique** (`v2/`) : chaleureuse et lisible, pensée pour les donateurs, bénévoles,
  communautés chrétiennes et partenaires de l'association. Fonds ivoire et sable, bleu marine
  du logo pour les titres et les sections fortes, or de l'espérance pour les boutons d'action.
  Titres à empattements (Lora), texte courant en Source Sans 3 à 18 px. Photos de terrain
  mises en avant, animations limitées à une apparition douce des blocs.

## Deux versions en ligne, le temps de choisir

Le site contient pour l'instant **deux versions**, pour que l'association puisse les comparer :

- **Version actuelle** (à la racine) : galerie sombre, animations GSAP. Chaque page affiche
  en bas un bouton doré « Voir la nouvelle version › ».
- **Nouvelle version** (dossier `v2/`) : la charte graphique décrite ci-dessus. Chaque page
  affiche un bouton « ‹ Revoir la version actuelle ». Les pages `v2/` ne sont pas
  référencées par les moteurs de recherche (`noindex`) et partagent le dossier `img/`.

Le bouton ouvre toujours la même page dans l'autre version.

**Une fois le choix fait :**

- *Nouvelle version retenue* : remplacer les pages, `css/` et `js/` de la racine par ceux
  de `v2/`, remettre les chemins `../img/` en `img/`, retirer la balise `noindex`, le bouton
  `compare-switch` et son style, puis supprimer `v2/` et `js/vendor/`.
- *Version actuelle conservée* : supprimer `v2/`, retirer le bouton `compare-switch` des
  pages et les règles « Comparaison temporaire » à la fin de `css/style.css`.

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : qui sommes-nous, actions locales et internationales, missions, projet Togo (compte à rebours), engagements |
| `association.html` | Qui sommes-nous ? : histoire, conviction, chiffres clés, engagement, valeurs, foi, boutique solidaire, transparence |
| `missions.html` | Nos missions : églises, orphelinats, eau potable, mission au Togo, protection de l'enfance, aînés, solidarité locale |
| `agir.html` | Agir avec nous : faire un don, bénévolat, partenaires et mécènes, boutique, questions fréquentes |
| `contact.html` | Formulaire de contact (ouvre la messagerie du visiteur, aucun serveur nécessaire) |
| `mentions-legales.html` | Mentions légales et confidentialité |

## Structure

- `css/style.css`, `js/main.js`, `js/vendor/` : version actuelle (GSAP 3.12.5 + ScrollTrigger en copie locale)
- `v2/` : nouvelle version (mêmes pages, `v2/css/style.css`, `v2/js/main.js` sans bibliothèque externe)
- `img/` : visuels de l'association optimisés en WebP (versions 700/800 px pour mobile)

Les liens vers `contact.html?sujet=…` (`don`, `benevolat`, `partenariat`, `togo`, `projet`,
`evenement`, `boutique`) présélectionnent le sujet du formulaire.

## À compléter avant la mise en ligne

Le site source ne contenait pas encore ces informations (ses pages Contact, Don, Agir et
Actualités affichaient le texte d'exemple du thème WordPress) :

1. **Adresse email** : `contact@lesmainsdelesperance.fr` est une adresse supposée, à confirmer
   ou remplacer (rechercher-remplacer dans les fichiers `.html`).
2. **Mentions légales** (`mentions-legales.html`) : siège social, numéro RNA, directeur ou
   directrice de la publication (repérés par « à compléter »).
3. **Don en ligne** : ajouter le lien de paiement (HelloAsso, par exemple) dans la section
   `#don` de `agir.html` ; un encadré indique pour l'instant que le don en ligne arrive bientôt.
4. **Réseaux sociaux** et **boutique solidaire** : à ajouter quand ils existeront.
5. **Image de partage** (`og:image`) : remplacer `img/og-image.jpg` par l'adresse complète
   une fois le domaine connu (par exemple `https://lesmainsdelesperance.fr/img/og-image.jpg`).

## Mise en ligne

Le site fonctionne tel quel sur n'importe quel hébergement statique. Avec GitHub Pages :
Settings → Pages → Deploy from a branch → choisir la branche et le dossier `/ (root)`.
Le fichier `.nojekyll` est déjà présent.

Pour le tester en local : `python3 -m http.server` dans ce dossier, puis ouvrir
http://localhost:8000.
