**ESCEN UNIVERSITY**

**CAHIER DES CHARGES**

**QR Code et vérification des relevés de notes**

| **Date** | 17 juillet 2026 |
| **Statut** | Projet, à valider |

# **1\. Objectif du projet**

Un étudiant transmet souvent son relevé de notes à un employeur. Aujourd'hui, ce document est un simple papier ou PDF, que rien ne permet de vérifier. Il peut être modifié ou falsifié, et l'employeur n'a pas de moyen simple de contrôler son authenticité.

ESCEN University veut ajouter un QR Code unique sur chaque relevé de notes de ses étudiants. En scannant ce code, le recruteur arrive sur une page internet, entre l'identifiant du relevé, et voit la version numérique officielle du document. Ajout d’une

## **Objectifs**

- Prouver que les relevés délivrés par l'université sont vrais.
- Réduire le risque de faux documents.
- Permettre une vérification en quelques secondes, depuis un téléphone, sans compte.
- Garder une trace de chaque vérification faite.

# **2\. Les personnes concernées**

| **Personne** | **Ce qu'elle fait avec le système** |
| --- | --- |
| Étudiant ou diplômé | Reçoit un relevé avec un QR Code, qu'il transmet aux recruteurs. |
| Recruteur | Scanne le QR Code et consulte le relevé officiel. |
| Service de la scolarité | Suit les relevés et corrige les éventuelles anomalies. |
| Service informatique | Gère la technique, la sécurité et la disponibilité du système. |

# **3\. Fonctionnement du système**

## **Création du relevé numérique et du QR Code**

1. La scolarité valide un relevé de notes dans le système actuel.
2. Le relevé est récupéré automatiquement par le nouveau système.
3. Un identifiant unique est créé pour ce relevé.
4. Un QR Code est créé, il contient le lien vers la page de vérification.
5. Le QR Code est ajouté sur le relevé remis à l'étudiant.

## **Vérification par le recruteur**

1. Le recruteur scanne le QR Code présent sur le relevé.
2. Il arrive sur la page de vérification et il saisit l’identifiant du relevé.
3. Il voit le relevé numérique officiel de l'université.
4. La vérification est enregistrée (date, heure, résultat).

## **Exemple concret**

Un étudiant obtient son relevé de licence avec un QR Code. Il l'envoie à un recruteur. Le recruteur scanne le code avec l'appareil photo de son téléphone : il arrive directement sur une page qui affiche le relevé officiel en version numérique. Il n'a rien eu à installer, ni à créer de compte.

# **4\. Ce que le système doit faire**

## **Le QR Code et l'identifiant**

Chaque relevé de notes doit recevoir un QR Code commun, généré automatiquement au moment de sa création.

- Chaque relevé reçoit un identifiant unique, impossible à deviner.
- Le QR Code contient un lien du type : https://verif.escen-university.fr/releve.
- L'identifiant et le QR Code ne changent jamais, même si le relevé est corrigé plus tard. Une nouvelle version est publiée sous le même identifiant, pour éviter de réimprimer le document.
- Le QR Code est placé à un endroit fixe et visible du relevé (par exemple en haut à droite).

## **La page de vérification**

C'est la page que voit le recruteur juste après avoir scanné le QR Code. Elle doit être la plus simple possible.

- Page publique, sans compte à créer, utilisable facilement sur téléphone.
- Affichage du relevé numérique officiel et à jour, une fois l'identifiant validé.
- En cas d'identifiant faux ou de relevé annulé, un message d'erreur clair s'affiche, sans donner d'indice utile à un fraudeur.
- Le système est protégé contre les robots qui essaieraient de deviner des identifiants au hasard.

## **La traçabilité des vérifications**

Chaque passage sur la page de vérification doit laisser une trace, pour permettre un contrôle en cas de doute.

- Chaque vérification est enregistrée : date, heure, identifiant, résultat (réussi ou échoué).
- Seules la scolarité et le service informatique peuvent consulter cet historique.
- Une alerte est envoyée en cas de comportement anormal, par exemple beaucoup de tentatives sur un même identifiant.
- Il est possible d'exporter cet historique pour un contrôle ou un audit.

## **La gestion par l'université**

La scolarité et le service informatique doivent pouvoir gérer le système au quotidien, sans dépendre d'un développeur externe pour les tâches courantes.

- Un espace d'administration sécurisé, réservé à la scolarité et le service IT.
- La possibilité de rechercher un relevé par identifiant ou par nom d'étudiant.
- La possibilité d'annuler un relevé en cas de fraude ou d'erreur grave.
- Les actions faites dans l'espace d'administration sont elles aussi enregistrées.

# **5\. Exigences importantes**

Ces exigences s'appliquent au QR Code et à la page de vérification. Elles conditionnent la confiance que les recruteurs pourront avoir dans le système.

| **Exigence** | **Ce que ça veut dire** |
| --- | --- |
| Sécurité | Connexion chiffrée (HTTPS), identifiants impossibles à deviner, protection contre les robots. |
| Rapidité | La page de vérification doit s'afficher en moins de 2 secondes. |
| Simplicité | Le site est pensé d'abord pour le téléphone, avec un parcours très court entre le scan et l'affichage du relevé. |
| Disponibilité | Le site doit être accessible presque tout le temps, car un recruteur peut vérifier un relevé à tout moment. |
| Protection des données | Seules les informations nécessaires sont affichées, conformément aux règles de protection des données personnelles (RGPD). |
| Compatibilité | Le QR Code doit fonctionner avec l'appareil photo classique de tous les smartphones, sans application à installer. |

# **6\. Fonctionnement technique proposé**

| **Partie** | **À quoi elle sert** |
| --- | --- |
| Page publique de vérification | Vue par les recruteurs après le scan du QR Code, utilisable sur mobile |
| Espace d'administration | Suivi, historique, gestion des relevés, réservé à la scolarité et à la DSI |
| Cœur du système | Crée les identifiants et QR Codes, gère les relevés et l'historique |
| Lien avec le système actuel | Récupère automatiquement les relevés validés par la scolarité |

## **Informations gérées par le système**

| **Élément** | **Contenu** |
| --- | --- |
| Relevé | Identifiant unique, étudiant, notes, date de création, statut (actif, annulé, remplacé) |
| Historique de vérification | Identifiant consulté, date, heure, résultat |

# **7\. Comment savoir que le système fonctionne bien**

- Un relevé importé obtient bien un identifiant, un QR Code, et une version numérique correcte.
- Le scan avec un téléphone normal amène bien à la page de vérification, sans application à installer.
- Un identifiant valide affiche bien le relevé officiel et à jour.
- Un identifiant faux affiche un message d'erreur clair, sans donner d'information utile à un fraudeur.
- Chaque vérification est bien enregistrée et visible dans l'espace d'administration.
- Les tests de sécurité ne révèlent aucun problème grave.

# **8\. Questions à régler avec l'université**

Ces questions doivent être tranchées avant ou pendant le développement du système.

## **Sur le fonctionnement**

1. Faut-il permettre de télécharger le relevé en PDF, ou juste le voir à l'écran ?
2. Faut-il montrer toutes les notes en détail, ou juste un résumé (moyenne, mention) ?
3. Que faire si un étudiant conteste un relevé déjà publié et déjà scanné par des recruteurs ?
4. Faut-il générer les codes QR et les relevés avec le système ?

## **Sur la sécurité**

1. Le QR Code et l'identifiant suffisent-ils, ou faut-il ajouter une information supplémentaire (nom, date de naissance) ?
2. Faut-il un contrôle anti-robot (CAPTCHA) dès le lancement, ou seulement en cas d'abus constaté ?
3. Combien de temps faut-il garder l'historique des vérifications ?

## **Sur la technique**

1. Le système actuel de la scolarité permet-il une récupération automatique des relevés, ou faut-il passer par des fichiers exportés régulièrement ?
2. Combien de relevés sont créés chaque année environ, pour bien dimensionner le système ?
3. Le nom de domaine du site de vérification est-il déjà disponible, ou faut-il le réserver ?
4. Le site doit-il être en français seulement, ou aussi en anglais ?
