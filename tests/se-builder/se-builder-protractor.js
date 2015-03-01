describe('Selenium Test Case', function() {
  it('should execute test case without errors', function() {
    var text, value, bool, source, url, title;
    var TestVars = {};
    browser.get("http://localhost:3000/");
    text = element(by.tagName('html')).getText();
    expect(text).toContain("" + "Hello World");
    element(by.linkText("About")).click();
    text = element(by.tagName('html')).getText();
    expect(text).toContain("" + "Example About Page");
    browser.get("http://localhost:3000/about");
    text = element(by.tagName('html')).getText();
    expect(text).toContain("" + "Example About Page");
    element(by.linkText("Home")).click();
    text = element(by.tagName('html')).getText();
    expect(text).toContain("" + "Hello World");
  });
});
