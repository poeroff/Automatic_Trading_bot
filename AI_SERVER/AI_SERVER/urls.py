from django.contrib import admin
from django.urls import path

from AI_SERVER import Data_Collection

urlpatterns = [
   
    path('tr_code_collection/', Data_Collection.tr_code_Collection),
    path('stock_data_collection/', Data_Collection.Stock_Data_Collection),

]
