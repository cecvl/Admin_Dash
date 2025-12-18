import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ArtPrintLogo from '../../assets/PaaJuuPrints.svg';
import { Button } from "../ui/button";
import UserMenu from "./UserMenu";
import LoginModal from "../features/auth/LoginModal";
import SignUpModal from "../features/auth/SignUpModal";

// Cart Icon Component with notification badge
const CartIcon: React.FC<{
  onClick: () => void;
  itemCount: number;
}> = ({ onClick, itemCount }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="relative flex items-center gap-2"
      onClick={onClick}
      aria-label={`Cart (${itemCount} items)`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17V13M9 19.5C9.8 19.5 10.5 20.2 10.5 21C10.5 21.8 9.8 22.5 9 22.5C8.2 22.5 7.5 21.8 7.5 21C7.5 20.2 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21C21.5 21.8 20.8 22.5 20 22.5C19.2 22.5 18.5 21.8 18.5 21C18.5 20.2 19.2 19.5 20 19.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Button>
  );
};

// Header Component
const Header: React.FC<{
  onHomeClick?: () => void;
  onCartClick?: () => void;
  cartItemCount?: number;
  currentPage: "home" | "artists" | "printshop";
}> = ({ onHomeClick, onCartClick, cartItemCount = 0, currentPage }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleArtistsClick = () => {
    navigate('/artists');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center border-b border-gray-200 bg-gray-50 px-3 py-3 sm:px-4">
        {/* LOGO ON THE LEFT */}
        <div className="flex flex-none items-center min-w-[62px]">
          <img
            src={ArtPrintLogo}
            alt="PaaJuu Prints Logo"
            className="ml-1 mr-6 cursor-pointer transition-opacity hover:opacity-80"
            style={{ height: 80, width: 'auto' }}
            onClick={onHomeClick}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-1 justify-center gap-2 min-w-0">
          <Button
            variant={currentPage === "home" ? "secondary" : "ghost"}
            onClick={onHomeClick}
            className="text-xs font-semibold tracking-wide"
          >
            NEW ARRIVALS
          </Button>

          <Button
            variant={currentPage === "artists" ? "secondary" : "ghost"}
            onClick={handleArtistsClick}
            className="text-xs font-semibold tracking-wide"
          >
            ARTISTS
          </Button>

          <Button
            variant={currentPage === "printshop" ? "secondary" : "ghost"}
            onClick={() => navigate('/print-shop')}
            className="text-xs font-semibold tracking-wide"
          >
            PRINT SHOP
          </Button>
        </div>

        {/* Right Side - Cart + Auth */}
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          {onCartClick && <CartIcon onClick={onCartClick} itemCount={cartItemCount} />}

          {loading ? (
            // Loading skeleton
            <div className="h-9 w-24 animate-pulse rounded-md bg-gray-200" />
          ) : isAuthenticated && user ? (
            // Authenticated: Show User Menu
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            // Not Authenticated: Show Login/Signup Buttons
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSignUpModal(true)}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSignUpClick={() => {
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        open={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onLoginClick={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
};

export default Header;
