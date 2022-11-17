import jsdom from 'jsdom';

const dom = new jsdom.JSDOM('<!DOCTYPE html>');
global.window = dom.window;
global.document = window.document;
global.HTMLElement = window.HTMLElement
global.NodeList = window.NodeList
global.navigator = dom.window.navigator;
