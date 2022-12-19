pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

  /**
    @title Badges Contract for the Superset Smart Trust Ecosystem
    @author LPSCRYPT
    @notice Allows different roles in the Superset ecosystem to obtain, issue, and perform various functions around non-transferable, soulbound badges
    @notice Reference guide for building transactions from a gnosis safe: https://help.gnosis-safe.io/en/articles/3738081-contract-interactions
    @dev ERC721 with custom access control system and tightly gatekept transfer functionality
    */
contract SupersetBadges is ERC721 {

    string constant INVALID_PERMISSIONS = "User does not have adequate permissions to perform this action.";

    /**
    @notice Roles determine which addresses have which permissions to interact within the contract
    @notice Roles are mutually exclusive, meaning that no single address can ever have more than one role at the same time
     */
    enum Role {
        None,
        Member,
        Issuer,
        Admin,
        Owner
    }

    /**
    @notice Current sole ownership address
    @dev Stored as separate variable for checking current owner in transferOwner()
     */
    address public ownerAddress;

    /** 
    @notice For n number of total badges ever minted, will return (n + 1)
    @dev Initialized at 1 in constructor to prevent collisions, as the tokenIds mapping defaults all currently held badgeIds per user to zero
    */
    uint256 public badgeCounter;   

    /**
    @notice Timer for delayed calling between initializeTransfer() and transferOwner() functions
    @notice Equal to TRANSFER_WINDOW + block.timestamp at time of initializeTransfer() call
     */
    uint256 public transferTimer;

    /**
    @notice Address of pending new Role.Owner 
    @notice Equal to zero address if there is no pending transfer active
    @notice Any active transferAddress must have Role.None
    @notice Any attempt to give a role to the transferAddress using addMembers(), addIssuers(), or addAdmins() must fail
     */
    address public transferAddress;

    /**
    @notice Time delay for transferOwner() process, in seconds
     */
    uint256 constant TRANSFER_WINDOW = 259200;

    /**
    @notice Maps user address to their assigned Role
    @notice Default value of 0 is equivalent to Role.None
     */
    mapping(address => Role) private userRole;

    /**
    @notice Maps tokenId to URI string
     */
    mapping(uint256 => string) private tokenURIs;

    /**
    @notice Maps user account to their currently active badgeId
    @notice A value of 0 indicates that an address has no active badge, being either revoked or never initialized
     */
    mapping(address => uint256) private tokenIds;

    /**
    @notice Requires caller of function to be Owner Role
     */
    modifier onlyOwner() {
        require(userRole[msg.sender] == Role.Owner, INVALID_PERMISSIONS);
        _;
    }

    /**
    @notice Requires caller of function to be Admin or Owner Role
     */
    modifier onlyAdmin() {
        require(userRole[msg.sender] == Role.Admin || userRole[msg.sender] == Role.Owner, INVALID_PERMISSIONS);
        _;
    }

    /**
    @notice Requires caller of function to be Issuer, Admin, or Owner Role
     */
    modifier onlyIssuer() {
        require(userRole[msg.sender] == Role.Issuer || userRole[msg.sender] == Role.Admin || userRole[msg.sender] == Role.Owner, INVALID_PERMISSIONS);
        _;
    }

    /**
    @notice Requires caller of function to be Member role
    @notice Only used for revokeSelf(), which can only be called by an existing badge holding member account
     */
    modifier onlyMember() {
        require(userRole[msg.sender] == Role.Member,  INVALID_PERMISSIONS);
        _;
    }

    /**
    @notice This event is emitted when a role is granted or removed from an address
    @param user The address updated
    @param roleType The new active role for user
     */
    event RoleUpdated(address user, Role roleType);

    /**
    @notice This event is emitted when a badge's URI is updated
    @param tokenId Unique Id of updated badge
    @param data URI string associated with updated badge at tokenId
     */
    event MetadataUpdated(uint256 tokenId, string data);

    /**
    @dev Takes basic 721 constructor inputs
    @dev Initializes _safe address as the initial Owner role
    @dev Initializes badgeCounter to 1, avoiding conflict using 0 in the tokenIds mapping
     */
    constructor(string memory _name, string memory _symbol, address _safe) ERC721(_name, _symbol) {
        _setRole(_safe, Role.Owner);
        ownerAddress = _safe;
        _iterateBadgeCounter();
    }

    /**
    @notice Enumerates badgeCoutner
     */
    function _iterateBadgeCounter() internal {
        badgeCounter += 1;
    }

    /**
    @notice Public transfers are overriden and disabled to create soulbound badge functionality
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        revert();
    }

    /**
    @notice Public transfers are overriden and disabled to create soulbound badge functionality
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        revert();
    }

    /**
    @notice Public transfers are overriden and disabled to create soulbound badge functionality
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        revert();
    }

    /** 
    @notice Adds new members and mints badges with tokenURIs
    @dev Indices in _newMembers will have badge with URI of corresponding index in _data
    @dev User to add must have Role.None 
    @dev Entire function will revert if a single account cannot be added as a Member
     */
    function addMembers(address[] calldata _newMembers, string[] calldata _data) public onlyIssuer {
        require(_newMembers.length == _data.length, "Array lengths don't match.");
         for (uint i=0; i<_newMembers.length; i++) {
             require(userRole[_newMembers[i]] == Role.None, 'Member to add must not have an existing role.');
             require(_newMembers[i] != transferAddress, 'Member to add must not be pending new Owner or zero address.');
             _setRole(_newMembers[i], Role.Member);
             _mint(_newMembers[i], badgeCounter);
             _updateURI(badgeCounter, _data[i]);
             tokenIds[_newMembers[i]] = badgeCounter;
             _iterateBadgeCounter();
         }
    }

    /** 
    @notice Adds new issuers
    @dev Entire function will revert if a single account cannot be added as an Issuer
     */
    function addIssuers(address[] calldata _newIssuers) public onlyAdmin {
         for (uint i=0; i<_newIssuers.length; i++) {
             require(userRole[_newIssuers[i]] == Role.None, 'Issuer to add must not have an existing role.');
             require(_newIssuers[i] != transferAddress, 'Issuer to add must not be pending new Owner or zero address.');
             _setRole(_newIssuers[i], Role.Issuer);
         }
    }

    /** 
    @notice Adds new admins
    @dev Entire function will revert if a single account cannot be added as an Admin
     */
    function addAdmins(address[] calldata _newAdmins) public onlyOwner {
         for (uint i=0; i<_newAdmins.length; i++) {
             require(userRole[_newAdmins[i]] == Role.None, 'Admin to add must not have an existing role.');
             require(_newAdmins[i] != transferAddress, 'Admin to add must not be pending new Owner or zero address.');
             _setRole(_newAdmins[i], Role.Admin);
         }
    }

    /** 
    @notice Revokes members
    @dev Burns badges of revoked members
    @dev Entire function will revert if a single account is not an active member and thus cannot be revoked
     */
    function revokeMembers(address[] calldata _members) public onlyAdmin { 
        for (uint i=0; i<_members.length; i++) {
             require(userRole[_members[i]] == Role.Member, 'User to revoke must be a member.');
             _setRole(_members[i], Role.None);
             _burn(tokenIds[_members[i]]);
             tokenIds[_members[i]] = 0;
         }
    }

    /** 
    @notice Revokes issuers
    @dev Entire function will revert if a single account is not an active issuer and thus cannot be revoked
     */
    function revokeIssuers(address[] calldata _issuers) public onlyAdmin {
        for (uint i=0; i<_issuers.length; i++) {
            require(userRole[_issuers[i]] == Role.Issuer, 'User to revoke must be an issuer.');
            _setRole(_issuers[i], Role.None);
        }
    }

    /** 
    @notice Revokes admins
    @dev Entire function will revert if a single admin is not an active admin and thus cannot be revoked
     */
    function revokeAdmins(address[] calldata _admins) public onlyAdmin {
        for (uint i=0; i<_admins.length; i++) {
            require(userRole[_admins[i]] == Role.Admin, 'User to revoke must be an admin.');
            _setRole(_admins[i], Role.None);
        }
    }

    /** 
    @notice Allows a member to revoke their own membership
    @dev Fails if account is not an active member 
    @dev Resets tokenId mapping for account to 0
     */
    function revokeSelf() public onlyMember {
        _setRole(msg.sender, Role.None);
        _burn(tokenIds[msg.sender]);
        tokenIds[msg.sender] = 0;
    }

    /**
    @notice Initiates the ownership role transfer process
    @notice Starts a time window equal in seconds to TRANSFER_WINDOW, after which transferOwner() may be called
     */
    function initiateTransfer(address _newOwner) public onlyOwner {
        require(transferAddress == address(0) && transferTimer == 0, 'There is already an ongoing transfer which has not been resolved.');
        require(userRole[_newOwner] == Role.None, "Cannot assign new owner to existing role.");
        require(_newOwner != address(0), 'Cannot transfer to zero address');
        transferTimer = block.timestamp + TRANSFER_WINDOW;
        transferAddress = _newOwner;
    }

    /**
    @notice Interrupts the transfer process and reinitializes state variables
     */
    function stopTransfer() public onlyOwner {
        delete transferTimer;
        delete transferAddress;
    }

    /** 
    @notice Transfers ownership role to new address, which must match that provided in initiateTransfer()
    @notice Can only be called by the current pending Owner address set by initiateTransfer()
    @dev Ensures that there can only ever be a single address occupying Role.Owner
    @param _accept Boolean value of acceptance of Ownership transfer by pending new Owner. True completes the transfer, False resets.
     */
    function transferOwner(bool _accept) public {
        require(msg.sender == transferAddress, 'Transfer must be finalized by the previously logged address of the pending new Owner.');
        require(transferTimer != 0, 'Please initialize transfer process with initiateTransfer()');
        require(block.timestamp > transferTimer, 'Timer for transferring ownership is still ongoing.');
        if (_accept) {
            _setRole(ownerAddress, Role.None);
            _setRole(transferAddress, Role.Owner);
            ownerAddress = transferAddress;
        }
        delete transferTimer;
        delete transferAddress;
    }

    /** 
    @notice Updates a single badge URI by tokenId
     */
    function updateURI(uint256 _tokenId, string calldata _data) public onlyAdmin {
        _updateURI(_tokenId, _data);
    }

    /** 
    @notice Updates an array of badge URIs by tokenId
    @notice Indices in _tokenIds will have badge with URI of corresponding index in _data
     */
    function batchUpdateURI(uint256[] calldata _tokenIds, string[] calldata _data) public onlyAdmin {
        require(_tokenIds.length == _data.length, "Array lengths do not match.");
        for(uint i=0; i<_tokenIds.length; i++) {
            _updateURI(_tokenIds[i], _data[i]);
        }
    }

    /**
    @dev Internal URI update
    @dev Emits a {MetadataUpdated} event
     */
    function _updateURI(uint256 _tokenId, string calldata _data) internal {
        require(_exists(_tokenId), "ERC721: invalid token ID");
        tokenURIs[_tokenId] = _data;
        emit MetadataUpdated(_tokenId, _data);
    }

    /**
    @dev Internal role update
    @dev Emits a {RoleUpdated} event
     */
    function _setRole(address _user, Role _role) internal {
        require(userRole[_user] != _role, "User already has this role.");
        require(_user != address(0), "Cannot give a role to the burn address.");
        userRole[_user] = _role;
        emit RoleUpdated(_user, _role);
    }

    /**
    @notice Returns the role of an account
    @return Enum Role of the account
     */
    function checkRole(address _user) public view returns(Role) {
        return userRole[_user];
    }

    /**
    @notice Returns the URI for a given badgeId
    @return URI of the badge
     */
    function checkURI(uint256 _tokenId) public view returns(string memory) {
        return tokenURIs[_tokenId];
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view override returns (string memory) {
        return "ipfs://";
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        _requireMinted(_tokenId);
        string memory baseURI = _baseURI();
        return string(abi.encodePacked(baseURI, checkURI(_tokenId)));
    }
}