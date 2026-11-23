/** Pure domain rules for order fulfilment and delivery status transitions. */
export const FULFILMENT_STAGES=['PLACED','CONFIRMED','PACKED','SHIPPED'];
export const DELIVERY_TRANSITIONS={ASSIGNED:['PICKED_UP','FAILED'],PICKED_UP:['IN_TRANSIT','FAILED'],IN_TRANSIT:['DELIVERED','FAILED'],DELIVERED:[],FAILED:[]};
export function canAdvanceFulfilment(from,to){return FULFILMENT_STAGES.indexOf(to)===FULFILMENT_STAGES.indexOf(from)+1 && FULFILMENT_STAGES.includes(to)}
export function canAdvanceDelivery(from,to){return (DELIVERY_TRANSITIONS[from]||[]).includes(to)}
export function overallFulfilment(items){
 if(!items.length)return 'PLACED';
 for(let i=FULFILMENT_STAGES.length-1;i>=0;i--){const candidate=FULFILMENT_STAGES[i];if(items.every(item=>FULFILMENT_STAGES.indexOf(item.status)>=i))return candidate}
 return 'PLACED';
}
