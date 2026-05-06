# Setup actions à faire par Ulysse

## 1. Créer le compte Supabase (5 min)

1. Aller sur supabase.com
2. Créer un projet (gratuit)
3. Nom : creative-fair-v60
4. Région : eu-west (Paris)
5. Mot de passe DB : noter dans password manager
6. Une fois créé, aller dans Settings > API
7. Copier :
   - Project URL → mettre dans NEXT_PUBLIC_SUPABASE_URL
   - anon public key → mettre dans NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role key → mettre dans SUPABASE_SERVICE_ROLE_KEY

## 2. Récupérer la clé Anthropic (1 min)

1. Aller sur console.anthropic.com
2. Settings > API Keys
3. Créer une clé "creative-fair-v60-dev"
4. Copier dans ANTHROPIC_API_KEY

## 3. Créer le repo GitHub privé (2 min)

1. Aller sur github.com
2. New repository
3. Nom : creative-fair-v60
4. Visibilité : Private
5. NE PAS cocher "Add README"
6. Créer

Puis dans le terminal :

```bash
cd /Users/ulysselemoine/Desktop/creative-fair-v60
git remote add origin https://github.com/USERNAME/creative-fair-v60.git
git push -u origin main
```

## 4. Connecter Vercel (5 min)

1. Aller sur vercel.com
2. Add New > Project
3. Sélectionner le repo creative-fair-v60
4. Vercel détecte Next.js automatiquement
5. AVANT de cliquer Deploy : ajouter les Environment Variables
   - ANTHROPIC_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL (mettre l'URL Vercel future)
6. Deploy

Tu obtiens une URL : creative-fair-v60.vercel.app
