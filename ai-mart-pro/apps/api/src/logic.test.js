import test from 'node:test';
import assert from 'node:assert/strict';
import {canAdvanceFulfilment,canAdvanceDelivery,overallFulfilment} from './logic.js';
test('vendor can advance only one fulfilment stage at a time',()=>{
 assert.equal(canAdvanceFulfilment('PLACED','CONFIRMED'),true);
 assert.equal(canAdvanceFulfilment('CONFIRMED','SHIPPED'),false);
 assert.equal(canAdvanceFulfilment('SHIPPED','DELIVERED'),false);
 assert.equal(canAdvanceFulfilment('PACKED','SHIPPED'),true);
});
test('delivery agent cannot skip stages or repeat final status',()=>{
 assert.equal(canAdvanceDelivery('ASSIGNED','DELIVERED'),false);
 assert.equal(canAdvanceDelivery('ASSIGNED','PICKED_UP'),true);
 assert.equal(canAdvanceDelivery('IN_TRANSIT','FAILED'),true);
 assert.equal(canAdvanceDelivery('DELIVERED','PICKED_UP'),false);
});
test('multi-vendor order uses slowest item fulfilment status',()=>{
 assert.equal(overallFulfilment([{status:'SHIPPED'},{status:'CONFIRMED'}]),'CONFIRMED');
 assert.equal(overallFulfilment([{status:'SHIPPED'},{status:'PACKED'}]),'PACKED');
 assert.equal(overallFulfilment([{status:'SHIPPED'},{status:'SHIPPED'}]),'SHIPPED');
});
