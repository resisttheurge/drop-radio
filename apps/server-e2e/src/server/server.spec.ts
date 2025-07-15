import axios from 'axios';

describe('GET /progress', () => {
  it('should return the current progress', async () => {
    const res = await axios.get(`/progress`);

    expect(res.status).toBe(200);
  });
});
