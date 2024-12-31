from gui import create_login_window
from kiwoom_api import LoginKiwoom



def main():
    root = create_login_window()
    root.mainloop()


if __name__ == "__main__":
    main()