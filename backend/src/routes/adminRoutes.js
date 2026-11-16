const router = require('express').Router();
const upload = require('../middleware/upload');
const c = require('../controllers/adminController');

const isId = (req, res, next, v) =>
  /^\d+$/.test(v) ? next() : res.status(400).json({ message: 'Invalid id' });
router.param('id', isId);
router.param('imageId', isId);

const img = (max = 1) => ({ types: upload.IMAGES, max });

const resource = (path, ctrl, uploader = []) => {
  router.get(path, ctrl.list);
  router.post(path, ...uploader, ctrl.create);
  router.put(`${path}/reorder`, ctrl.reorder); // must come before /:id
  router.get(`${path}/:id`, ctrl.getOne);
  router.put(`${path}/:id`, ...uploader, ctrl.update);
  router.delete(`${path}/:id`, ctrl.remove);
};

router.get('/dashboard', c.dashboard);

router.get('/profile', c.profile.get);
router.put('/profile', ...upload.fields({
  profile_image: img(),
  resume: { types: upload.PDF, max: 1 },
}), c.profile.update);

router.get('/settings', c.settings.get);
router.put('/settings', ...upload.fields({ logo: img(), favicon: img() }), c.settings.update);

resource('/projects', c.projects, upload.fields({ thumbnail: img(), images: img(10) }));
router.delete('/projects/:id/images/:imageId', c.removeProjectImage);
resource('/skills', c.skills, upload.fields({ icon: img() }));
resource('/skill-categories', c.skillCategories);
resource('/experiences', c.experiences);
resource('/certificates', c.certificates, upload.fields({ file: { types: upload.DOCS, max: 1 } }));
resource('/education', c.education);
resource('/social-links', c.socialLinks);

router.get('/messages', c.messages.list);
router.get('/messages/:id', c.messages.get);
router.patch('/messages/:id', c.messages.setRead);
router.delete('/messages/:id', c.messages.remove);

module.exports = router;
