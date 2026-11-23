from fastapi.testclient import TestClient
from main import app
c=TestClient(app)
key={'X-AI-Key':'replace_this_shared_secret'}
def test_security():
    assert c.post('/forecast',json={'product_id':'x'}).status_code==401
def test_inventory_math():
    r=c.post('/inventory',headers=key,json={'predicted_units':30,'horizon':30,'current_stock':2,'lead_time_days':7,'safety_days':3})
    assert r.status_code==200
    assert r.json()['reorder_point']==10
    assert r.json()['suggested_restock_units']==8
def test_recommend_cold_start():
    r=c.post('/recommend',headers=key,json={'products':[{'id':'one','name':'Speaker','category_id':'cat','price':400}]})
    assert r.status_code==200 and r.json()['ids']==['one']
def test_health():assert c.get('/health').status_code==200
