from gui import Program_Gui
from kiwoom_api import KiwoomAPI
from  Auth.Login import Auth

def main():
    a = Auth()
    Kiwoom_OpenAPI= KiwoomAPI()
    kiwoom = a.Kiwoom_Login()
    Program = Program_Gui()
    if(kiwoom.GetConnectState()):
        root = Program_Gui.create_login_window()
        root.mainloop()
        # Kiwoom_OpenAPI.All_Stock_Data(kiwoom)
        Program.on_login(kiwoom)
       
if __name__ == "__main__":
    main()






























