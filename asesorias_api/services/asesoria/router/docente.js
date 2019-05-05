const Router = require('koa-router');
const koaBody = require('koa-body');
const logger = require('winston');

const { basePath } = global;
const { TypeOrmSqlClient: db } = require(`${basePath}/config/client`);

const { DocenteRepository } = require(`${basePath}/src/infrastructure/repositories/typeorm`);
const {
  CreateDocente,
} = require(`${basePath}/src/application/user`);

function getJoiFlash(error) {
  let msg = '';

  error.details.forEach((element) => {
    msg += ` ${element.message}`;
  });

  return msg;
}

function makeErrorResponse(err) {
  logger.error(err.message + err.stack);
  const flash = err.isJoi ? getJoiFlash(err) : err.message;

  return {
    error: err.code,
    flash,
    data: {},
  };
}

const router = new Router({
  prefix: '/docentes',
});

router.post('/', koaBody(), async function (ctx, next) {
  let response;

  const data = {
    ...ctx.request.body,
    ...ctx.params,
    ...ctx.query,
  };

  try {
    // TODO: Agregar validadores
    const repository = new DocenteRepository(db);
    const service = new CreateDocente(repository);
    const docente = await service.process(data);

    code = 201;
    response = {
      error: 0,
      flash: 'Successful!',
      data: {
        id: docente.id || null,
      },
    };
    code = docente ? 201 : 400;
  } catch (err) {
    code = 404;
    response = makeErrorResponse(err);
  } finally {
    ctx.status = code;
    ctx.body = response;
    next();
  }
});

module.exports = router;