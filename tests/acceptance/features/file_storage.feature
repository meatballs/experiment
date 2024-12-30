Feature: File Storage Management
  As a user
  I want to store and manage files
  So that I can organize my data effectively

  Scenario: Upload a new file
    Given I am on the file upload page
    When I select a file to upload
    And the file is less than 100MB
    Then the file should be stored with a unique ID
    And I should see the file in my stored files list

  Scenario: View file details
    Given I have stored files
    When I select a specific file
    Then I should see the file details including:
      | name      |
      | type      |
      | size      |
      | timestamp |

  Scenario: Delete stored file
    Given I have at least one stored file
    When I choose to delete a file
    Then the file should be removed from storage
    And it should no longer appear in my files list
