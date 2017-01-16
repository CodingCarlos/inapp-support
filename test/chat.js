const expect = require('chai').expect;

const utils = require('../js/utils');

describe('Chat inapp', () => {
  describe('validates file extensions', () => {
    it('jpg is a valid extension', () => {
      const file = {name:'chat.jpg'};

      const ext = utils.validateExtension(file);
      
      expect(ext).to.equal('.jpg');
    });

    it('png is a valid extension', () => {
      const file = {name:'chat.png'};

      const ext = utils.validateExtension(file);

      expect(ext).to.equal('.png');
    });
    
    it('js is NOT a valid extension', () => {
      const file = {name:'chat.js'};
      
      const ext = utils.validateExtension(file);
      
      expect(ext).to.be.null;
    });
    
    it('PNG is a valid extension', () => {
      const file = {name:'chat.PNG'};
      
      const ext = utils.validateExtension(file);
      
      expect(ext).to.equal('.png');
    });
    
    it('no extension is NOT valid', () => {
      const file = {name:'chat'};
      
      const ext = utils.validateExtension(file);

      expect(ext).to.be.null;
    });

    it('just extension is NOT valid', () => {
      const file = {name:'jpg'};
      
      const ext = utils.validateExtension(file);

      expect(ext).to.be.null;
    });

  });
});