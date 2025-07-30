const Joi = require('joi');

describe('User Validation (Direct Joi)', () => {
  const schema = Joi.object({
    password: Joi.string().max(20).required(),
  });

  test('should fail for password > 20 chars', () => {
    const longPassword = 'thispasswordiswaytoolong123456';

    const { error } = schema.validate({ password: longPassword });

    expect(error).toBeInstanceOf(Error); 
    expect(error.message).toMatch(/must be less than or equal to 20 characters/);
  });
});
