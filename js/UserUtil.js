/**
 * @author jieliu
 * attention : include sessionChecker.jsp first.
 */
var GROUP_USER_TYPE_SUPERADMIN = 2;
var GROUP_USER_TYPE_PUBLISHER = 1;
var GROUP_USER_TYPE_USER = 0;

var USER_ROLE_GROUP_ADMIN = "group-admin";
var USER_ROLE_SUB_USER = "sub-user";

var UserUtil = {
	
	

    /**
     * role is group-admin or not.
     * @return true or false
     */
    isGroupAdmin: function(){
    	if("undefined" == typeof roleCode){
    		return false;
    	}
        if (roleCode == USER_ROLE_GROUP_ADMIN) {
            return true;
        }
        
        return false;
    },
    
    /**
     * role is sub-user or not.
     * @return true or false
     */
    isSubUser: function(){
    	if("undefined" == typeof roleCode){
    		return false;
    	}
        if (roleCode == USER_ROLE_SUB_USER) {
            return true;
        }
        
        return false;
    },
    
    /**
     * current user has group admin function or not.
     * @return true or false
     */
    hasGroupAdminFunction: function(){
    	if("undefined" == typeof roleCode){
    		return false;
    	}
        if (roleCode == USER_ROLE_GROUP_ADMIN) {
            return true;
        }
        
        return false;
    },
    
    /**
     * current user has publish resource and resouce management function or not.
     * @return true or false
     */
    hasPublisherFunction: function(){
    	if("undefined" == typeof roleCode){
    		return false;
    	}
        if (roleCode == USER_ROLE_GROUP_ADMIN
			&& groupUserType == GROUP_USER_TYPE_PUBLISHER) {
            return true;
        }
        
        return false;
    },
    
    /**
     * current user has resouce supporter functioin or not.
     * @return true or false
     */
    hasSupporterFunction: function(){
    	if("undefined" == typeof roleCode){
    		return false;
    	}
        if (groupUserType == GROUP_USER_TYPE_PUBLISHER) {
            return true;
        }
        
        return false;
    },
    
    /**
     * current user has superadmin function or not.
     * @return true or false
     */
    hasSuperadminFunction: function(){
    	if("undefined" == typeof roleCode){
    		return false;
    	}
		if (roleCode == USER_ROLE_GROUP_ADMIN
		&& groupUserType == GROUP_USER_TYPE_SUPERADMIN) {
			return true;
		}
		
        return false;
    },
    
    /**
     * current user has platform supporter or not.
     * @return true or false
     */
    hasPlatformSupporterFunction: function(){
    	if("undefined" == typeof roleCode){
    		return false;
    	}
		if (groupUserType == GROUP_USER_TYPE_SUPERADMIN) {
			return true;
		}
        return false;
    }
	
}
