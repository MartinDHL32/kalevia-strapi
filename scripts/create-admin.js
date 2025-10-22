// kalevia-cms/scripts/create-admin.js
const { default: createStrapi } = require('@strapi/strapi');

async function createAdmin() {
  const strapi = await createStrapi().load();

  try {
    console.log('🔍 Recherche des utilisateurs admin existants...');
    
    // Récupérer tous les admins
    const admins = await strapi.db.query('admin::user').findMany();
    console.log(`📊 Nombre d'admins trouvés : ${admins.length}`);

    // Email et mot de passe du nouvel admin
    const adminEmail = 'admin@kalevia.fr';
    const adminPassword = 'Kalevia2025!';

    // Vérifier si l'admin existe déjà
    const existingAdmin = await strapi.db.query('admin::user').findOne({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('⚠️  Un admin avec cet email existe déjà. Suppression...');
      await strapi.db.query('admin::user').delete({ where: { id: existingAdmin.id } });
    }

    // Créer le nouvel admin
    console.log('✨ Création du nouvel admin...');
    
    const superAdminRole = await strapi.db.query('admin::role').findOne({
      where: { code: 'strapi-super-admin' }
    });

    if (!superAdminRole) {
      throw new Error('❌ Rôle Super Admin introuvable');
    }

    const hashedPassword = await strapi.service('admin::auth').hashPassword(adminPassword);

    const newAdmin = await strapi.db.query('admin::user').create({
      data: {
        firstname: 'Admin',
        lastname: 'Kalevia',
        email: adminEmail,
        password: hashedPassword,
        isActive: true,
        blocked: false,
        roles: [superAdminRole.id]
      }
    });

    console.log('✅ Admin créé avec succès !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email    : ' + adminEmail);
    console.log('🔑 Password : ' + adminPassword);
    console.log('🌐 URL Admin: https://kalevia-strapi-production.up.railway.app/admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT : Changez ce mot de passe après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

createAdmin();