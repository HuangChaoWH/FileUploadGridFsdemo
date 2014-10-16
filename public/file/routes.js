'use strict';

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/login/');
}

function ensureAdmin(req, res, next) {
  if (req.user.canPlayRoleOf('admin')) {
    return next();
  }
  res.redirect('/');
}

function ensureAccount(req, res, next) {
  if (req.user.canPlayRoleOf('account')) {
    if (req.app.get('require-account-verification')) {
      if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
        return res.redirect('/account/verification/');
      }
    }
    return next();
  }
  res.redirect('/');
}

exports = module.exports = function(app, passport) {


  //---------------------------------------------
  // Home, Login. Signup, Login
  //---------------------------------------------

   // Index
  app.get('/', require('./views/index').init);

  //sign up
  app.get('/signup/', require('./views/signup/index').init);
  app.post('/signup/', require('./views/signup/index').signup);

  //Signup using social
  app.post('/signup/social/', require('./views/signup/index').signupSocial);

  //Signup using Twitter
  app.get('/signup/twitter/', passport.authenticate('twitter', { callbackURL: '/signup/twitter/callback/' }));
  app.get('/signup/twitter/callback/', require('./views/signup/index').signupTwitter);

  //Signup using Github

  app.get('/signup/github/', passport.authenticate('github', { callbackURL: '/signup/github/callback/', scope: ['user:email'] }));
  app.get('/signup/github/callback/', require('./views/signup/index').signupGitHub);
  
  //Signup using facebook
  app.get('/signup/facebook/', passport.authenticate('facebook', { callbackURL: '/signup/facebook/callback/', scope: ['email'] }));
  app.get('/signup/facebook/callback/', require('./views/signup/index').signupFacebook);

  //Signup using Google+
  app.get('/signup/google/', passport.authenticate('google', { callbackURL: '/signup/google/callback/', scope: ['profile email'] }));
  app.get('/signup/google/callback/', require('./views/signup/index').signupGoogle);

  //login 
  app.get('/login/', require('./views/login/index').init);
  app.post('/login/', require('./views/login/index').login);

  //Forgot Password on Login
  app.get('/login/forgot/', require('./views/login/forgot/index').init);
  app.post('/login/forgot/', require('./views/login/forgot/index').send);

  //Reset password on login 
  app.get('/login/reset/', require('./views/login/reset/index').init);
  app.get('/login/reset/:email/:token/', require('./views/login/reset/index').init);
  app.put('/login/reset/:email/:token/', require('./views/login/reset/index').set);

  //Logout on Password
  app.get('/logout/', require('./views/logout/index').init);

  //Login using Twitter
  app.get('/login/twitter/', passport.authenticate('twitter', { callbackURL: '/login/twitter/callback/' }));
  app.get('/login/twitter/callback/', require('./views/login/index').loginTwitter);

  //Login using Github
  app.get('/login/github/', passport.authenticate('github', { callbackURL: '/login/github/callback/' }));
  app.get('/login/github/callback/', require('./views/login/index').loginGitHub);

  //Login using Facebook
  app.get('/login/facebook/', passport.authenticate('facebook', { callbackURL: '/login/facebook/callback/' }));
  app.get('/login/facebook/callback/', require('./views/login/index').loginFacebook);

  //Login using Google+
  app.get('/login/google/', passport.authenticate('google', { callbackURL: '/login/google/callback/', scope: ['profile email'] }));
  app.get('/login/google/callback/', require('./views/login/index').loginGoogle);

  //---------------------------------------------
  // Admin 
  //---------------------------------------------

  //Defining for all admin paths
  app.all('/admin*', ensureAuthenticated);
  app.all('/admin*', ensureAdmin);
  app.get('/admin/', require('./views/admin/index').init);

  //admin > search
  app.get('/admin/search/', require('./views/admin/search/index').find);

  //admin > users : Show all users in Admin Panel
  app.get('/admin/users/', require('./views/admin/users/index').find);
  app.post('/admin/users/', require('./views/admin/users/index').create);
  app.get('/admin/users/:id/', require('./views/admin/users/index').read);
  app.put('/admin/users/:id/', require('./views/admin/users/index').update);
  app.put('/admin/users/:id/password/', require('./views/admin/users/index').password);
  app.put('/admin/users/:id/role-admin/', require('./views/admin/users/index').linkAdmin);
  app.delete('/admin/users/:id/role-admin/', require('./views/admin/users/index').unlinkAdmin);
  app.put('/admin/users/:id/role-account/', require('./views/admin/users/index').linkAccount);
  app.delete('/admin/users/:id/role-account/', require('./views/admin/users/index').unlinkAccount);
  app.delete('/admin/users/:id/', require('./views/admin/users/index').delete);

  //admin > administrators : Show all admins  in Admin Panel
  app.get('/admin/administrators/', require('./views/admin/administrators/index').find);
  app.post('/admin/administrators/', require('./views/admin/administrators/index').create);
  app.get('/admin/administrators/:id/', require('./views/admin/administrators/index').read);
  app.put('/admin/administrators/:id/', require('./views/admin/administrators/index').update);
  app.put('/admin/administrators/:id/permissions/', require('./views/admin/administrators/index').permissions);
  app.put('/admin/administrators/:id/groups/', require('./views/admin/administrators/index').groups);
  app.put('/admin/administrators/:id/user/', require('./views/admin/administrators/index').linkUser);
  app.delete('/admin/administrators/:id/user/', require('./views/admin/administrators/index').unlinkUser);
  app.delete('/admin/administrators/:id/', require('./views/admin/administrators/index').delete);

  //admin > admin groups : Show all Admin created Groups
  app.get('/admin/admin-groups/', require('./views/admin/admin-groups/index').find);
  app.post('/admin/admin-groups/', require('./views/admin/admin-groups/index').create);
  app.get('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').read);
  app.put('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').update);
  app.put('/admin/admin-groups/:id/permissions/', require('./views/admin/admin-groups/index').permissions);
  app.delete('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').delete);

  //admin > accounts : Show all User profiles
  app.get('/admin/accounts/', require('./views/admin/accounts/index').find);
  app.post('/admin/accounts/', require('./views/admin/accounts/index').create);
  app.get('/admin/accounts/:id/', require('./views/admin/accounts/index').read);
  app.put('/admin/accounts/:id/', require('./views/admin/accounts/index').update);
  app.put('/admin/accounts/:id/user/', require('./views/admin/accounts/index').linkUser);
  app.delete('/admin/accounts/:id/user/', require('./views/admin/accounts/index').unlinkUser);
  app.post('/admin/accounts/:id/notes/', require('./views/admin/accounts/index').newNote);
  app.post('/admin/accounts/:id/status/', require('./views/admin/accounts/index').newStatus);
  app.delete('/admin/accounts/:id/', require('./views/admin/accounts/index').delete);

  //admin > statuses : Status of a specific user. This is Legacy feature
  app.get('/admin/statuses/', require('./views/admin/statuses/index').find);
  app.post('/admin/statuses/', require('./views/admin/statuses/index').create);
  app.get('/admin/statuses/:id/', require('./views/admin/statuses/index').read);
  app.put('/admin/statuses/:id/', require('./views/admin/statuses/index').update);
  app.delete('/admin/statuses/:id/', require('./views/admin/statuses/index').delete);

  //admin > File : Uploading files 
  app.get('/admin/file', require('./views/admin/file/index').find);
  app.post('/admin/file/', require('./views/admin/file/index').create);
  app.get('/admin/file/:id/', require('./views/admin/file/index').read);
  app.put('/admin/file/:id/', require('./views/admin/file/index').update);
  app.delete('/admin/file/:id/', require('./views/admin/file/index').delete);

  //admin > file > search
  app.get('/admin/file/search/', require('./views/admin/search/index').find);


  //admin > Project : Grouping files together
  app.get('/admin/project/', require('./views/admin/project/index').find); 
  app.post('/admin/project/', require('./views/admin/project/index').create);
  app.get('/admin/project/:id/', require('./views/admin/project/index').read);
  app.put('/admin/project/:id/', require('./views/admin/project/index').update);
  app.delete('/admin/project/:id/', require('./views/admin/project/index').delete);

  //admin > project > search
  app.get('/admin/project/search/', require('./views/admin/search/index').find);


  //admin > Project Categories : Defining Project Categories
  app.get('/admin/categories/', require('./views/admin/categories/index').find);
  app.post('/admin/categories/', require('./views/admin/categories/index').create);
  app.get('/admin/categories/:id/', require('./views/admin/categories/index').read);
  app.put('/admin/categories/:id/', require('./views/admin/categories/index').update);
  app.delete('/admin/categories/:id/', require('./views/admin/categories/index').delete);


  //admin > data : Default Parameters
  app.get('/admin/data', require('./views/admin/data/index').init);
  app.post('/admin/data/', require('./views/admin/data/index').create);
  app.get('/admin/data/:id/', require('./views/admin/data/index').read);
  app.put('/admin/data/:id/', require('./views/admin/data/index').update);
  app.delete('/admin/data/:id/', require('./views/admin/data/index').delete);

  //admin > data : Search
  app.get('/admin/data/search/', require('./views/admin/search/index').find);
 
  //---------------------------------------------
  // Account
  //---------------------------------------------

  //Defining functions for all users
  app.all('/account*', ensureAuthenticated);
  app.all('/account*', ensureAccount);
  app.get('/account/', require('./views/account/index').init);


  // CRUD for data in Account : Personal Parameters
  app.get('/account/data/', require('./views/account/data/index').init);
  app.post('/account/data/', require('./views/account/data/index').create);
  app.get('/account/data/:id/', require('./views/account/data/index').read);
  app.put('/account/data/:id/', require('./views/account/data/index').update);
  app.delete('/account/data/:id/', require('./views/account/data/index').delete);

  
  //account > settings
  app.get('/account/settings/', require('./views/account/settings/index').init);
  app.put('/account/settings/', require('./views/account/settings/index').update);
  app.put('/account/settings/identity/', require('./views/account/settings/index').identity);
  app.put('/account/settings/password/', require('./views/account/settings/index').password);


  //route not found
  app.all('*', require('./views/http/index').http404);
};
