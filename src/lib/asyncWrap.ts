const asyncWrap = (asyncFuction: any) => {
  return async (req: any, res: any, next: any) => {
    try {
      return await asyncFuction(req, res, next);
    } catch (err) {
      return next(err);
    }
  };
};

export const userSchemaAsyncWrap = (asyncFuction: any) => {
    return async (next: any) => {
      try {
        return await asyncFuction(next);
      } catch (err) {
        return next(err);
      }
    };
  };

  export default asyncWrap